/**
 * @fileOverview DNTRNG™ Intelligence Grading Engine.
 * 
 * Purpose: Deterministic evaluation of assessment responses.
 * Refactored: v19.6 - Extracted from submit route for architectural isolation.
 */

import { Question } from '@/types/quiz';
import { parseRegistryArray, compareValues } from './quiz-utils';

/**
 * Standardized Array Match Protocol
 * Performs order-independent case-insensitive match of two string arrays with semantic normalization.
 */
function arraysMatch(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const normalizedA = a.map(v => String(v ?? '').trim().toLowerCase()).sort();
  const normalizedB = b.map(v => String(v ?? '').trim().toLowerCase()).sort();
  return normalizedA.every((v, i) => compareValues(v, normalizedB[i]));
}

/**
 * CORE: Intelligence Grading Engine
 * IMPLEMENTS: Deterministic Association Protocol (Association-based vs Index-based)
 */
export function gradeQuestion(question: Question, submitted: unknown): boolean {
  const type = String(question.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const correctArr = parseRegistryArray(question.correct_answer);
  const orderArr = parseRegistryArray(question.order_group);

  switch (type) {
    case 'single_choice':
    case 'singlechoice':
    case 'oneanswer':
    case 'true_false':
    case 'truefalse':
    case 'dropdown':
      return compareValues(submitted, correctArr[0]);

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
      
      return orderArr.every((masterKey, i) => {
        const normalizedMasterKey = String(masterKey).trim().toLowerCase();
        const actualKey = userKeys.find(k => k.trim().toLowerCase() === normalizedMasterKey);
        if (!actualKey) return false;
        return compareValues(userResponses[actualKey], correctArr[i]);
      });

    case 'matching':
      if (typeof submitted !== 'object' || !submitted) return false;
      const matchResponses = submitted as Record<string, any>;
      const matchKeys = Object.keys(matchResponses);
      
      return correctArr.every(pair => {
        const [k, v] = String(pair).split('|').map(s => s.trim().toLowerCase());
        const actualKey = matchKeys.find(mk => mk.trim().toLowerCase() === k);
        if (!actualKey) return false;
        return compareValues(matchResponses[actualKey], v);
      });

    case 'ordering':
      const subArr = Array.isArray(submitted) ? submitted.map(String) : [];
      if (subArr.length !== correctArr.length) return false;
      return correctArr.every((v, i) => compareValues(subArr[i], v));

    case 'short_text':
    case 'shorttext':
      return compareValues(submitted, correctArr[0]);

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
 * Streak Enforcement Protocol
 */
export function truncateAtFirstWrong(responses: any[], masterQuestions: Question[]) {
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
