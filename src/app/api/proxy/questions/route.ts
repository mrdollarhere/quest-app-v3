import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/questions
 * Retrieves questions for a module with corrected answers stripped for security.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing module ID' }, { status: 400 });
  }

  try {
    const questions = await gasGet('getQuestions', { id });
    
    // SECURITY PROTOCOL: Strip correct answers before sending to student terminal
    const safeQuestions = Array.isArray(questions) 
      ? questions.map(({ correct_answer, ...q }) => q)
      : [];

    return NextResponse.json(safeQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
