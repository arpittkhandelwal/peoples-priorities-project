import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { groq, GROQ_MODEL } from '@/lib/groq';

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const prompt = `Generate a JSON array of 15 highly realistic citizen development suggestions for Jaipur district, India. 
Mix the languages: some purely in Hindi, some in English, and some in Hinglish.
Vary the locations across different wards in Jaipur (e.g., Mansarovar, Malviya Nagar, Vaishali Nagar, Sanganer, etc).
Vary the categories among: education, health, water_and_sanitation, roads_and_transport, electricity, other.
Make them sound like real citizens typing on a phone — some angry, some polite, some with typos, some very specific, some vague.

Return ONLY a valid JSON array like this:
[
  { "raw_text": "...", "location_text": "...", "category_guess": "..." }
]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const responseText = completion.choices[0]?.message?.content || "[]";
    
    let submissionsToSeed = [];
    try {
      const parsed = JSON.parse(responseText);
      // Depending on the model, it might return { "suggestions": [...] } instead of an array directly if forced to JSON object
      if (Array.isArray(parsed)) {
        submissionsToSeed = parsed;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        submissionsToSeed = parsed.suggestions;
      } else {
        // Find the first array property
        const keys = Object.keys(parsed);
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            submissionsToSeed = parsed[key];
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse Groq response for seed', responseText);
      throw new Error('Invalid JSON from Groq seed');
    }

    const inserted = [];

    for (const sub of submissionsToSeed) {
      // Generate some rough random coordinates for Jaipur (26.9124, 75.7873 +/- a bit)
      const lat = 26.85 + Math.random() * 0.15;
      const lng = 75.70 + Math.random() * 0.15;

      const { data, error } = await supabase
        .from('submissions')
        .insert({
          raw_text: sub.raw_text,
          location: { lat, lng },
          location_text: sub.location_text,
          status: 'new'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Insert error:", error);
        continue;
      }

      inserted.push(data);

      // Trigger pipeline step 3a manually
      await fetch(origin + '/api/pipeline/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: data.id })
      });
    }

    return NextResponse.json({ success: true, seededCount: inserted.length });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
