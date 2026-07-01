import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { groq, GROQ_MODEL } from '@/lib/groq';

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    // 1. Fetch unclustered submissions (status = clustered)
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, category, location_text, translated_text')
      .eq('status', 'clustered')
      .limit(50); // process in batches

    if (fetchError) throw fetchError;
    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ message: 'No submissions to cluster' });
    }

    const prompt = `You are analyzing a batch of citizen development suggestions from Jaipur constituency to identify recurring themes.

Here are ${submissions.length} submissions:
${JSON.stringify(submissions, null, 2)}

Group these into thematic clusters. Submissions should only be grouped together if they represent the same underlying issue or need (not just the same category — 'school needs more classrooms' and 'school needs better toilets' are different clusters even though both are 'education').
A cluster can have 1 or more submissions. Try to group similar ones. 

Return ONLY valid JSON:
{
  "clusters": [
    {
      "theme": "<short descriptive theme name>",
      "category": "<category>",
      "submissionIds": ["<id>", "<id>"],
      "summary": "<2-3 sentence summary of what citizens are asking for>"
    }
  ]
}`;

    // 2. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const responseText = completion.choices[0]?.message?.content || "{}";
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Groq response', responseText);
      throw new Error('Invalid JSON from Groq');
    }

    const newClusters = [];

    // 3. Save Clusters to Supabase
    for (const cluster of parsedResult.clusters) {
      const { data, error: insertError } = await supabase
        .from('clusters')
        .insert({
          theme: cluster.theme,
          category: cluster.category,
          submission_ids: cluster.submissionIds,
          submission_count: cluster.submissionIds.length,
          summary: cluster.summary,
          // Calculate centroid location based on submissions in real app, here we mock it roughly in Jaipur
          centroid_location: { lat: 26.9124, lng: 75.7873 } 
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Cluster insert error", insertError);
        continue;
      }
      
      newClusters.push(data);

      // Mark these submissions as ranked (or processed) so they aren't clustered again
      await supabase
        .from('submissions')
        .update({ status: 'ranked' })
        .in('id', cluster.submissionIds);
        
      // Trigger ranking for this cluster asynchronously
      fetch(origin + '/api/pipeline/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: data.id }),
      }).catch(e => console.error("Failed to trigger ranking:", e));
    }

    return NextResponse.json({ success: true, clusters: newClusters });
  } catch (error: any) {
    console.error('Clustering error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
