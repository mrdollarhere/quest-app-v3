import { NextResponse } from 'next/server';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';
import { calculateTotalScore, calculateScoreForQuestion } from '@/lib/quiz-utils';

/**
 * Helper to enforce the "one wrong ends all" Race mode protocol.
 * Discards any responses that occur after the first incorrect answer.
 */
function truncateAtFirstWrong(responses: any[], masterQuestions: any[]) {
  const result = [];
  for (const r of responses) {
    const q = masterQuestions.find(mq => String(mq.id) === String(r.questionId));
    if (!q) continue;
    
    result.push(r);
    
    // SECURITY PROTOCOL: If this answer is wrong, the mission terminates here.
    if (!calculateScoreForQuestion(q, r.answer)) {
      break;
    }
  }
  return result;
}

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

    // STREAK ENFORCEMENT: If in Race mode, truncate responses at the first failure
    const processedResponses = mode === 'race' 
      ? truncateAtFirstWrong(responses, masterQuestions)
      : responses;

    // Server-side Score Calculation (The only score trusted by the platform)
    const calculatedScore = calculateTotalScore(masterQuestions, processedResponses);
    const totalQuestions = masterQuestions.length;
    
    // For Race mode, the streak length is the number of correct answers achieved before termination
    const streakLength = mode === 'race' ? calculatedScore : undefined;

    // Registry Commitment
    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses: processedResponses, // Archive only the valid portion of the mission
      mode,
      certificateId
    });

    return NextResponse.json({ 
      score: calculatedScore, 
      total: totalQuestions,
      success: true,
      certificateId,
      streakLength,
      mode
    });
  } catch (error) {
    console.error('[Submit Proxy Error]', error);
    return NextResponse.json({ error: 'The registry handshake failed. Results not saved.' }, { status: 500 });
  }
}
