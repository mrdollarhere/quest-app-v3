import { Question, HotspotZone } from '@/types/quiz';

/**
 * Fisher-Yates shuffle algorithm for stable randomization.
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Robustly parses a registry field that might be a JSON array or a comma-separated string.
 */
export const parseRegistryArray = (input: any): string[] => {
  if (!input) return [];
  
  if (Array.isArray(input)) return input.map(item => String(item ?? "").trim());

  const str = String(input).trim();
  if (!str) return [];
  
  if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(item => String(item ?? "").trim());
    } catch (e) {}
  }
  
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

/**
 * Utility to find a value in a registry object by checking multiple key variations.
 */
export const getRegistryValue = (obj: any, keys: string[]): any => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    
    const normalizedK = k.toLowerCase().replace(/_/g, '').replace(/ /g, '');
    for (const actualKey in obj) {
      const normalizedActual = actualKey.toLowerCase().replace(/_/g, '').replace(/ /g, '');
      if (normalizedActual === normalizedK) return obj[actualKey];
    }
  }
  return undefined;
};

/**
 * Calculates whether a user's response is correct for a given question.
 * IMPLEMENTS: Deterministic Association Protocol (Association-based matching)
 */
export const calculateScoreForQuestion = (q: Question, response: any): boolean => {
  if (!q) return false;
  
  const questionType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const correctArr = parseRegistryArray(q.correct_answer);

  if (questionType === 'rating') {
    if (response === undefined || response === null) return false;
    if (correctArr.length === 0) return true;
    const userRating = parseInt(String(response));
    const targetRating = parseInt(String(correctArr[0]));
    if (isNaN(userRating) || isNaN(targetRating)) return false;
    return userRating === targetRating;
  }

  if (q.correct_answer === undefined && questionType !== 'hotspot') return false;
  if (response === undefined || response === null) return false;
  
  if (['singlechoice', 'oneanswer', 'truefalse', 'shorttext', 'dropdown'].includes(questionType)) {
    const userVal = String(response || "").trim().toLowerCase();
    const targetVal = String(correctArr[0] || "").trim().toLowerCase();
    return userVal === targetVal;
  } 
  
  if (['multiplechoice', 'manyanswers'].includes(questionType)) {
    const resArr = (Array.isArray(response) ? response : []).map(r => String(r).trim().toLowerCase()).sort();
    const sortedCorrect = [...correctArr].map(c => String(c).trim().toLowerCase()).sort();
    return JSON.stringify(resArr) === JSON.stringify(sortedCorrect);
  } 
  
  if (questionType === 'ordering') {
    const responseArr = (Array.isArray(response) ? response : []).map(r => String(r).trim().toLowerCase());
    const targetArr = [...correctArr].map(c => String(c).trim().toLowerCase());
    return JSON.stringify(responseArr) === JSON.stringify(targetArr);
  } 
  
  if (questionType === 'hotspot') {
    try {
      const zones: HotspotZone[] = JSON.parse(q.metadata || "[]");
      const correctZoneIds = zones.filter(z => z.isCorrect).map(z => z.id).sort();
      if (Array.isArray(response)) {
        const selectedIds = [...response].map(String).sort();
        return JSON.stringify(selectedIds) === JSON.stringify(correctZoneIds);
      }
      return false;
    } catch (e) { return false; }
  } 
  
  if (questionType === 'matching') {
    const userResp = (response || {}) as Record<string, string>;
    const userKeys = Object.keys(userResp);
    if (userKeys.length !== correctArr.length) return false;

    return correctArr.every(pair => {
      const [k, v] = String(pair).split('|').map(s => s.trim().toLowerCase());
      const actualKey = userKeys.find(uk => uk.trim().toLowerCase() === k);
      if (!actualKey) return false;
      return String(userResp[actualKey] || "").trim().toLowerCase() === v;
    });
  }

  // MULTIPLE T/F & MATRIX ASSOCIATION LOGIC
  if (['multipletruefalse', 'multitf', 'matrixchoice', 'matrix'].includes(questionType)) {
    const masterItems = parseRegistryArray(q.order_group);
    const userResp = (response || {}) as Record<string, string>;
    const userKeys = Object.keys(userResp);

    return masterItems.every((item, i) => {
      const normalizedMasterKey = item.trim().toLowerCase();
      const actualKey = userKeys.find(uk => uk.trim().toLowerCase() === normalizedMasterKey);
      if (!actualKey) return false;

      const userVal = String(userResp[actualKey] || "").trim().toLowerCase();
      const correctVal = String(correctArr[i] || "").trim().toLowerCase();
      return userVal === correctVal;
    });
  }
  
  return false;
};

/**
 * Calculates the total score for a set of responses.
 */
export const calculateTotalScore = (questions: Question[], responses: { questionId: string; answer: any }[]): number => {
  if (!questions || !responses) return 0;
  let score = 0;
  questions.forEach(q => {
    const response = responses.find(r => r.questionId === q.id)?.answer;
    if (calculateScoreForQuestion(q, response)) {
      score++;
    }
  });
  return score;
};
