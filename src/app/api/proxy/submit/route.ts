import { NextResponse } from 'next/server';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';
import { Question } from '@/types/quiz';

/**
 * UTILITY: Standardized Array Match Protocol
 * Performs order-independent exact match of two string arrays.
 */
function arraysMatch(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

/**
 * UTILITY: Registry Field Parser
 * Robustly parses fields that might be arrays or stringified JSON arrays.
 */
function parseJsonField(field: unknown): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    const trimmed = field.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return trimmed.split(',').map(s => s.trim());
      }
    }
    return trimmed.split(',').map(s => s.trim());
  }
  return [];
}

/**
 * CORE: Intelligence Grading Engine
 * Applies specific validation protocols based on the interaction type.
 */
function gradeQuestion(question: Question, submitted: unknown): boolean {
  const type = String(question.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const correctArr = parseJsonField(question.correct_answer);
  const orderArr = parseJsonField(question.order_group);

  switch (type) {
    case 'single_choice':
    case 'oneanswer':
    case 'truefalse':
    case 'dropdown':
      return String(submitted ?? '') === String(correctArr[0] ?? '');

    case 'multiple_choice':
    case 'manyanswers':
      const sub = Array.isArray(submitted) ? submitted.map(String) : [String(submitted ?? '')];
      return arraysMatch(sub, correctArr.map(String));

    case 'multiple_true_false':
    case 'matrix_choice':
      if (typeof submitted !== 'object' || !submitted) return false;
      return orderArr.every((key, i) => 
        String((submitted as any)[key] ?? '') === String(correctArr[i] ?? '')
      );

    case 'matching':
      if (typeof submitted !== 'object' || !submitted) return false;
      return correctArr.every(pair => {
        const [k, v] = String(pair).split('|').map(s => s.trim());
        return String((submitted as any)[k] ?? '') === String(v ?? '');
      });

    case 'ordering':
      const subArr = Array.isArray(submitted) ? submitted.map(String) : [];
      if (subArr.length !== correctArr.length) return false;
      return correctArr.every(
        (v, i) => String(v) === String(subArr[i])
      );

    case 'short_text':
      return String(submitted ?? '').trim().toLowerCase() 
        === String(correctArr[0] ?? '').trim().toLowerCase();

    case 'hotspot':
      try {
        const zones = typeof question.metadata === 'string' ? JSON.parse(question.metadata) : (question.metadata || []);
        const correctZones = zones
          .filter((z: any) => z.isCorrect === true)
          .map((z: any) => String(z.id));
        const subZones = Array.isArray(submitted) ? submitted.map(String) : [];
        
        return correctZones.length > 0 &&
          correctZones.every((id: string) => subZones.includes(id)) &&
          subZones.every((id: string) => correctZones.includes(id));
      } catch {
        return false;
      }

    case 'rating':
      if (!correctArr || correctArr.length === 0) return true; // Survey mode
      const diff = Math.abs(Number(submitted) - Number(correctArr[0]));
      return diff === 0;

    default:
      return false;
  }
}

/**
 * PROTOCOL: Streak Enforcement
 * Discards all responses that occur after the first incorrect answer in Race mode.
 */
function truncateAtFirstWrong(responses: any[], masterQuestions: Question[]) {
  const result = [];
  for (const r of responses) {
    const q = masterQuestions.find(mq => String(mq.id) === String(r.questionId));
    if (!q) continue;
    
    result.push(r);
    if (!gradeQuestion(q, r.answer)) {
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

    // SCORING PROTOCOL: Calculate total and build review audit
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
        options: q.options, // Protocol v18.9: Include options for multiple choice review display
        submittedAnswer: answer,
        correctAnswer: parseJsonField(q.correct_answer),
        orderGroup: parseJsonField(q.order_group),
        metadata: q.metadata,
        isCorrect
      };
    });

    const totalQuestions = masterQuestions.length;
    const streakLength = mode === 'race' ? calculatedScore : undefined;

    // Registry Commitment
    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses: JSON.stringify(reviewData), // Archive the full audit
      mode,
      certificateId
    });

    return NextResponse.json({ 
      score: calculatedScore, 
      total: totalQuestions,
      success: true,
      certificateId,
      streakLength,
      mode,
      reviewData
    });
  } catch (error) {
    console.error('[Submit Proxy Error]', error);
    return NextResponse.json({ error: 'The registry handshake failed. Results not saved.' }, { status: 500 });
  }
}
