import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { geminiModel } from '@/lib/gemini';
import jaipurData from '@/lib/data/jaipur_public_data.json';

export async function POST(request: Request) {
  try {
    const { clusterId } = await request.json();

    if (!clusterId) {
      return NextResponse.json({ error: 'Missing clusterId' }, { status: 400 });
    }

    // 1. Fetch cluster
    const { data: cluster, error: fetchError } = await supabase
      .from('clusters')
      .select('*')
      .eq('id', clusterId)
      .single();

    if (fetchError || !cluster) {
      throw new Error(`Failed to fetch cluster: ${fetchError?.message}`);
    }

    // 2. Fetch all other recent rankings to give context
    const { data: otherRankings } = await supabase
      .from('rankings')
      .select('cluster_id, priority_score, justification, clusters(theme, summary)')
      .order('generated_at', { ascending: false })
      .limit(5);

    // 3. Match category to public dataset
    let datasetStat = "No specific dataset point available.";
    let datasetSource = "N/A";
    let datasetName = "N/A";
    
    if (cluster.category === 'education' || cluster.category?.includes('school')) {
      datasetStat = `Pupil Teacher Ratio is ${jaipurData.metrics.education.pupil_teacher_ratio}. ${jaipurData.metrics.education.schools_with_drinking_water_percent}% schools have drinking water.`;
      datasetSource = jaipurData.metrics.education.source;
      datasetName = "UDISE+";
    } else if (cluster.category === 'health' || cluster.category?.includes('hospital')) {
      datasetStat = `${jaipurData.metrics.health.primary_health_centers} PHCs in district.`;
      datasetSource = jaipurData.metrics.health.source;
      datasetName = "NFHS-5";
    } else if (cluster.category === 'water_and_sanitation' || cluster.category?.includes('water')) {
      datasetStat = `${jaipurData.metrics.water_and_sanitation.households_with_piped_water_percent}% households have piped water.`;
      datasetSource = jaipurData.metrics.water_and_sanitation.source;
      datasetName = "Census 2011";
    }

    const otherClustersContext = otherRankings?.map(r => 
      `- Theme: ${r.clusters?.theme}, Score: ${r.priority_score}`
    ).join('\n') || "None yet.";

    const prompt = `You are advising an MP's office on development priority ranking. You must weigh citizen demand against objective public data — do not rank purely by submission volume.

Cluster: ${cluster.theme}
Summary: ${cluster.summary}
Number of citizen submissions: ${cluster.submission_count}
Relevant public data point: ${datasetStat} (source: ${datasetSource})

Other clusters competing for budget/attention this cycle:
${otherClustersContext}

Score this cluster's priority from 0-100 relative to the others, and write a 3-4 sentence justification an MP's office staffer with no technical background could read and immediately understand — reference both the citizen demand AND the data point explicitly. Be honest if citizen demand and data suggest different conclusions.

Return ONLY valid JSON:
{ 
  "priorityScore": <0-100>, 
  "justification": "<text>" 
}`;

    // 4. Call Gemini
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const responseText = result.response.text();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini response', responseText, e);
      throw new Error('Invalid JSON from Gemini');
    }

    // 5. Insert Ranking
    const { data: ranking, error: insertError } = await supabase
      .from('rankings')
      .insert({
        cluster_id: clusterId,
        priority_score: parsedResult.priorityScore,
        justification: parsedResult.justification,
        supporting_data: {
          datasetName,
          relevantStat: datasetStat,
          statSource: datasetSource
        }
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: ranking });
  } catch (error: any) {
    console.error('Ranking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
