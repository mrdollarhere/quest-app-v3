import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { buildErrorResponse } from '@/lib/utils/api-helpers';

/**
 * AI EXPLANATION PROTOCOL
 * 
 * Generates an educational context for incorrect responses.
 * Public endpoint for student access during assessment review.
 */
export async function POST(request: Request) {
  try {
    const { questionText, questionType, correctAnswer, studentAnswer } = await request.json();

    if (!questionText || !correctAnswer) {
      return buildErrorResponse('Missing diagnosis parameters', 400);
    }

    const systemPrompt = `You are a helpful educational assistant for a Vietnamese learning platform. 
    A student answered a quiz question incorrectly. Explain in 2-3 simple, encouraging sentences why the correct answer is right. 
    Write in Vietnamese only.`;

    const userPrompt = `
    Question: ${questionText}
    Question Type: ${questionType}
    Correct Answer: ${Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}
    Student Answered: ${typeof studentAnswer === 'object' ? JSON.stringify(studentAnswer) : studentAnswer}

    Explain why the correct answer is right. Return ONLY the explanation text.`;

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
