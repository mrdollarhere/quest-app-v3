import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { buildErrorResponse } from '@/lib/utils/api-helpers';

/**
 * AI EXPLANATION PROTOCOL (GROUNDED)
 * 
 * Generates an educational context for incorrect responses.
 * Strictly grounded in the provided correct answer.
 */
export async function POST(request: Request) {
  try {
    const { questionText, questionType, correctAnswer, studentAnswer } = await request.json();

    if (!questionText || !correctAnswer) {
      return buildErrorResponse('Missing diagnosis parameters', 400);
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

    const response = await ai.generate({
      system: systemPrompt,
      prompt: userPrompt,
      config: {
        temperature: 0.5,
      }
    });

    return NextResponse.json({ 
      success: true, 
      explanation: response.text 
    });

  } catch (error: any) {
    console.error('[AI Explanation Error]', error);
    return buildErrorResponse('The intelligence node is currently unreachable.', 500);
  }
}
