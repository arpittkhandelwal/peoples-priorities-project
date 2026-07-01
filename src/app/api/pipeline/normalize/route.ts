import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { geminiModel } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    // 1. Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      throw new Error(`Failed to fetch submission: ${fetchError?.message}`);
    }

    if (submission.status !== 'new') {
      return NextResponse.json({ message: 'Submission already processed' });
    }

    let textToProcess = submission.raw_text;
    
    if (!textToProcess || textToProcess === 'No text provided') {
      if (submission.audio_url) {
        textToProcess = "Mock transcribed text from audio";
      }
    }

    const prompt = `You are processing a citizen development suggestion submitted to an Indian MP's office.
Input text (may be Hindi, Hinglish, or English): ${textToProcess}

Return ONLY valid JSON, no markdown, no preamble:
{
  "translatedText": "<English translation/normalization>",
  "detectedLanguage": "<language code>",
  "category": "<one of: education, water_and_sanitation, roads_and_transport, health, electricity, other>",
  "urgencySignal": "<low|medium|high — based on language used>",
  "extractedLocation": "<any location detail mentioned in the text, or null>"
}`;

    // 3. Call Gemini
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

    // 4. Update Supabase
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        translated_text: parsedResult.translatedText,
        raw_language: parsedResult.detectedLanguage,
        category: parsedResult.category,
        urgency_signal: parsedResult.urgencySignal,
        location_text: parsedResult.extractedLocation,
        status: 'clustered' // Set to clustered so it gets picked up by next step
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error('Normalization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
