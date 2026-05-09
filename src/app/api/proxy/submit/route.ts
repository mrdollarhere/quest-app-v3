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

    // SECURITY PROTOCOL: Fetch correct answers directly from registry for verification
    const masterQuestions = await gasGet('getQuestions', { id: testId });
    
    if (!masterQuestions || !Array.isArray(masterQuestions)) {
      return NextResponse.json({ error: 'Module questions not found in registry' }, { status: 404 });
    }

    // Server-side Score Calculation (The only score trusted by the platform)
    const calculatedScore = calculateTotalScore(masterQuestions, responses);
    const totalQuestions = masterQuestions.length;
    
    // Registry Commitment
    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses, // Full response audit for forensic review
      mode,
      certificateId
    });

    return NextResponse.json({ 
      score: calculatedScore, 
      total: totalQuestions,
      success: true,
      certificateId
    });
  } catch (error) {
    console.error('[Submit Proxy Error]', error);
    return NextResponse.json({ error: 'The registry handshake failed. Results not saved.' }, { status: 500 });
  }
}
