import { NextResponse } from 'next/server';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';
import { Question } from '@/types/quiz';

/**
 * UTILITY: Standardized Array Match Protocol
 * Performs order-independent case-insensitive match of two string arrays.
 */
function arraysMatch(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const normalizedA = a.map(v => String(v ?? '').trim().toLowerCase()).sort();
  const normalizedB = b.map(v => String(v ?? '').trim().toLowerCase()).sort();
  return normalizedA.every((v, i) => v === normalizedB[i]);
}

/**
 * UTILITY: Registry Field Parser
 * Robustly parses fields that might be arrays or stringified JSON arrays.
 */
function parseJsonField(field: unknown): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(v => typeof v === 'string' ? v.trim() : v);
  if (typeof field === 'string') {
    const trimmed = field.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map(v => typeof v === 'string' ? v.trim() : v);
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
 * IMPLEMENTS: Deterministic Association Protocol (Association-based vs Index-based)
 */
function gradeQuestion(question: Question, submitted: unknown): boolean {
  const type = String(question.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const correctArr = parseJsonField(question.correct_answer);
  const orderArr = parseJsonField(question.order_group);

  switch (type) {
    case 'single_choice':
    case 'singlechoice':
    case 'oneanswer':
    case 'true_false':
    case 'truefalse':
    case 'dropdown':
      return String(submitted ?? '').trim().toLowerCase() === String(correctArr[0] ?? '').trim().toLowerCase();

    case 'multiple_choice':
    case 'multiplechoice':
    case 'manyanswers':
      const sub = Array.isArray(submitted) ? submitted.map(String) : [String(submitted ?? '')];
      return arraysMatch(sub, correctArr.map(String));

    case 'multiple_true_false':
    case 'multipletruefalse':
    case 'matrix_choice':
    case 'matrixchoice':
      if (typeof submitted !== 'object' || !submitted) return false;
      
      const userResponses = submitted as Record<string, any>;
      const userKeys = Object.keys(userResponses);
      
      // ASSOCIATION PROTOCOL: Match user keys to registry keys case-insensitively
      return orderArr.every((masterKey, i) => {
        const normalizedMasterKey = String(masterKey).trim().toLowerCase();
        
        // Find the key in submitted object that matches the master key
        const actualKey = userKeys.find(k => k.trim().toLowerCase() === normalizedMasterKey);
        if (!actualKey) return false; // Missing node

        const userVal = String(userResponses[actualKey] ?? '').trim().toLowerCase();
        const correctVal = String(correctArr[i] ?? '').trim().toLowerCase();
        return userVal === correctVal;
      });

    case 'matching':
      if (typeof submitted !== 'object' || !submitted) return false;
      const matchResponses = submitted as Record<string, any>;
      const matchKeys = Object.keys(matchResponses);
      
      return correctArr.every(pair => {
        const [k, v] = String(pair).split('|').map(s => s.trim().toLowerCase());
        const actualKey = matchKeys.find(mk => mk.trim().toLowerCase() === k);
        if (!actualKey) return false;
        return String(matchResponses[actualKey] ?? '').trim().toLowerCase() === v;
      });

    case 'ordering':
      const subArr = Array.isArray(submitted) ? submitted.map(String) : [];
      if (subArr.length !== correctArr.length) return false;
      return correctArr.every(
        (v, i) => String(v).trim().toLowerCase() === String(subArr[i]).trim().toLowerCase()
      );

    case 'short_text':
    case 'shorttext':
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
      if (!correctArr || correctArr.length === 0) return true; 
      const diff = Math.abs(Number(submitted) - Number(correctArr[0]));
      return diff === 0;

    default:
      return false;
  }
}

/**
 * PROTOCOL: Streak Enforcement
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
        correctAnswer: parseJsonField(q.correct_answer),
        orderGroup: parseJsonField(q.order_group),
        metadata: q.metadata,
        isCorrect
      };
    });

    const totalQuestions = masterQuestions.length;
    const streakLength = mode === 'race' ? calculatedScore : undefined;

    await gasPost('submitResponse', {
      userName,
      userEmail,
      testId,
      score: calculatedScore,
      total: totalQuestions,
      duration,
      responses: JSON.stringify(reviewData),
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
