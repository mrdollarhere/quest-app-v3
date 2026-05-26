import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/utils/auth-helpers';
import { buildErrorResponse } from '@/lib/utils/api-helpers';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * AI GENERATION PROTOCOL
 * 
 * Orchestrates question generation via Google Gemini.
 * Logic: Validates admin identity, constructs educational prompt, parses JSON output.
 */

const QuestionSchema = z.object({
  question_text: z.string(),
  question_type: z.string(),
  options: z.array(z.string()),
  correct_answer: z.array(z.string()),
  order_group: z.array(z.string()),
  difficulty: z.string(),
  explanation: z.string()
});

const GenerationResponseSchema = z.array(QuestionSchema);

export async function POST(request: Request) {
  // 1. IDENTITY HANDSHAKE
  const session = await getAdminSession();
  if (!session) return buildErrorResponse('Unauthorized', 401);

  // 2. CONFIGURATION AUDIT
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AI] GEMINI_API_KEY not configured.');
    return buildErrorResponse('AI features not configured. Contact administrator.', 503);
  }

  try {
    const { topic, sourceText, questionCount, questionTypes, difficulty, language } = await request.json();

    // 3. PROMPT ENGINEERING
    const languageInstruction = 
      language === 'vi' ? 'Write in Vietnamese only.' :
      language === 'en' ? 'Write in English only.' :
      'Write in BOTH (Bilingual): Vietnamese first, followed by English in square brackets [Like this].';

    const systemPrompt = `You are an educational assessment expert creating quiz questions for a digital literacy and academic platform. 
    You create high-fidelity, accurate questions for Vietnamese students. 
    ${languageInstruction}
    Difficulty level: ${difficulty}.
    
    Return ONLY a valid JSON array of objects. No markdown formatting, no explanations outside the JSON.`;

    const userPrompt = `Generate ${questionCount} quiz questions based on the following:
    Topic: ${topic}
    ${sourceText ? `Source Content: ${sourceText}` : ''}
    Requested Types: ${questionTypes.join(', ')}
    
    Data Schema requirements:
    - question_type must be one of: single_choice, multiple_choice, true_false, short_text.
    - For single_choice: 4 options, 1 correct_answer.
    - For multiple_choice: 4-5 options, 2-3 correct_answers.
    - For true_false: options should be empty [], correct_answer is ["True"] or ["False"].
    - For short_text: options should be empty [], correct_answer is 1 precise string.
    - explanation: A brief context for the answer.
    
    All array fields (options, correct_answer, order_group) must be strings in the output JSON.`;

    // 4. GENERATION PULSE
    const response = await ai.generate({
      system: systemPrompt,
      prompt: userPrompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text;
    
    // 5. REGISTRY PARSING
    // Remove markdown code blocks if present
    const jsonString = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(jsonString);

    return NextResponse.json({ 
      success: true, 
      questions: questions,
      count: questions.length 
    });

  } catch (error: any) {
    console.error('[AI Generation Error]', error);
    if (error.message?.includes('429')) {
      return buildErrorResponse('Rate limit reached. Please wait a moment.', 429);
    }
    return buildErrorResponse('Failed to generate questions. Please try a different topic.', 500);
  }
}
