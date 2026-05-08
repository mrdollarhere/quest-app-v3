import { NextResponse } from 'next/server';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';
import { calculateTotalScore } from '@/lib/quiz-utils';

/**
 * POST /api/proxy/submit
 * Orchestrates server-side scoring and registry commitment.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testId, responses, userName, userEmail, duration, certificateId, mode } = body;

    if (!testId || !responses) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
    }

    // SECURITY PROTOCOL: Fetch correct answers directly from registry
    const masterQuestions = await gasGet('getQuestions', { id: testId });
    
    // Server-side Score Calculation
    const calculatedScore = calculateTotalScore(masterQuestions, responses);
    const totalQuestions = Array.isArray(masterQuestions) ? masterQuestions.length : 0;
    
    // Registry Commitment
    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses, // Full response audit
      mode,
      certificateId
    });

    return NextResponse.json({ 
      score: calculatedScore, 
      total: totalQuestions,
      success: true
    });
  } catch (error) {
    console.error('[Submit Proxy Error]', error);
    return NextResponse.json({ error: 'Failed to commit results' }, { status: 500 });
  }
}
