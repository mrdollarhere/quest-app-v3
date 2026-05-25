import { NextResponse } from 'next/server';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';
import { Question } from '@/types/quiz';
import { gradeQuestion, truncateAtFirstWrong } from '@/lib/grading-engine';
import { parseRegistryArray } from '@/lib/quiz-utils';

/**
 * POST /api/proxy/submit
 * 
 * Evaluates student responses and commits results to the registry.
 * Refactored v19.6: Evaluation logic extracted to grading-engine.ts.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testId, responses, userName, userEmail, duration, certificateId, mode } = body;

    if (!testId || !responses) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
    }

    const masterQuestions = await gasGet('getQuestions', { id: testId });
    
    if (!masterQuestions || !Array.isArray(masterQuestions)) {
      return NextResponse.json({ error: 'Module questions not found in registry' }, { status: 404 });
    }

    const processedResponses = mode === 'race' 
      ? truncateAtFirstWrong(responses, masterQuestions)
      : responses;

    let calculatedScore = 0;
    const reviewData = masterQuestions.map((q: Question) => {
      const userResp = processedResponses.find(r => String(r.questionId) === String(q.id));
      const answer = userResp ? userResp.answer : null;
      const isCorrect = gradeQuestion(q, answer);
      
      if (isCorrect) calculatedScore++;

      return {
        questionId: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        image_url: q.image_url, 
        options: q.options,
        submittedAnswer: answer,
        correctAnswer: parseRegistryArray(q.correct_answer),
        orderGroup: parseRegistryArray(q.order_group),
        metadata: q.metadata,
        isCorrect
      };
    });

    const totalQuestions = masterQuestions.length;

    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses: reviewData,
      mode,
      certificateId
    });

    return NextResponse.json({ 
      score: calculatedScore, 
      total: totalQuestions,
      success: true,
      certificateId,
      mode,
      reviewData
    });
  } catch (error) {
    console.error('[Submit Proxy Error]', error);
    return NextResponse.json({ error: 'The registry handshake failed.' }, { status: 500 });
  }
}
