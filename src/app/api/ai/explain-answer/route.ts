import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/lib/utils/api-helpers';

/**
 * AI EXPLANATION PROTOCOL (GROUNDED)
 * 
 * Generates an educational context for incorrect responses.
 * Strictly grounded in the provided correct answer.
 * Refactored: v19.7 - Using direct REST API for maximum resilience and timeout control.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionText, questionType, correctAnswer, studentAnswer } = body;

    console.log('[AI Explain] Route hit');
    console.log('[AI Explain] Question:', questionText);
    console.log('[AI Explain] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('[AI Explain] GOOGLE_GENAI_API_KEY exists:', !!process.env.GOOGLE_GENAI_API_KEY);

    if (!questionText || !correctAnswer) {
      return buildErrorResponse('Missing diagnosis parameters', 400);
    }

    // IDENTITY HANDSHAKE: Determine which registry key is available
    const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!GEMINI_KEY) {
      console.error('[AI Explain] AI not configured - API Key missing');
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const correctStr = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : String(correctAnswer);
    const studentStr = typeof studentAnswer === 'object' ? JSON.stringify(studentAnswer) : String(studentAnswer);

    const systemPrompt = `You are an assistant for an educational quiz platform. Your only job is to help a student understand why a specific answer is correct for a given question.

CRITICAL RULES you must follow:
1. The correct answer provided below is ABSOLUTE TRUTH for this quiz. Never question it, never suggest alternative answers, never say 'however' or 'but actually'.
2. Build your explanation TO SUPPORT and JUSTIFY the provided correct answer only.
3. If you personally think a different answer might also be correct, IGNORE that thought entirely.
4. Keep it to 2-3 simple sentences.
5. Be encouraging and student-friendly.
6. Write in Vietnamese.`;

    const userPrompt = `
    Question: ${questionText}
    The correct answer for this quiz is: ${correctStr}
    The student chose: ${studentStr}

    Explain in 2-3 Vietnamese sentences why ${correctStr} is the correct answer for this question. 
    Do not mention any other possible answers. Do not say the student was wrong. 
    Just explain the correct answer warmly and clearly.

    Return ONLY the explanation text. No JSON. No formatting. No preamble.`;

    // COMBINED PROMPT PROTOCOL
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Timeout

    console.log('[AI Explain] Calling Gemini REST API...');
    
    try {
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300
          }
        })
      });

      clearTimeout(timeoutId);

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error('[AI Explain] Gemini API error:', geminiResponse.status, errText);
        
        if (geminiResponse.status === 429) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        
        return NextResponse.json({ 
          error: 'AI service error: ' + geminiResponse.status,
          details: errText 
        }, { status: 502 });
      }

      const geminiData = await geminiResponse.json();
      const explanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!explanation) {
        console.error('[AI Explain] No explanation in response payload');
        return NextResponse.json({ error: 'No explanation generated' }, { status: 500 });
      }

      console.log('[AI Explain] Pulse successful');
      return NextResponse.json({ success: true, explanation });

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('[AI Explain] Intelligence node timed out after 15s');
        return NextResponse.json({ error: 'Request timed out' }, { status: 408 });
      }
      throw err;
    }

  } catch (error: any) {
    console.error('[AI Explain] Forensic Audit Error:', error);
    return NextResponse.json({ 
      error: 'AI Error: ' + (error?.message || 'Unknown exception'),
      details: error?.toString()
    }, { status: 500 });
  }
}
