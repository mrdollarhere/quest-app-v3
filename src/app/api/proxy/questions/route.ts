import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/questions
 * Retrieves questions for a module.
 * If training=true is passed, correct answers are included for immediate feedback.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const isTraining = searchParams.get('training') === 'true';

  if (!id) {
    return NextResponse.json({ error: 'Missing module ID' }, { status: 400 });
  }

  try {
    const questions = await gasGet('getQuestions', { id });
    
    // SECURITY PROTOCOL: Strip correct answers before sending to student terminal
    // UNLESS in Training Mode where immediate feedback is required for learning.
    const safeQuestions = Array.isArray(questions) 
      ? questions.map(q => {
          if (isTraining) return q;
          const { correct_answer, ...safeQ } = q;
          return safeQ;
        })
      : [];

    return NextResponse.json(safeQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
