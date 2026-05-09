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
  
  // If it's already an array, just normalize items to strings
  if (Array.isArray(input)) return input.map(item => String(item ?? "").trim());

  const str = String(input).trim();
  if (!str) return [];
  
  // Try parsing as JSON first for maximum data integrity
  if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(item => String(item ?? "").trim());
    } catch (e) {
      // Fallback to standard comma splitting if JSON is malformed
    }
  }
  
  // Fallback for comma separated strings
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
 * Used for both server-side scoring and client-side review feedback.
 */
export const calculateScoreForQuestion = (q: Question, response: any): boolean => {
  if (!q) return false;
  
  const questionType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const correctArr = parseRegistryArray(q.correct_answer);

  // 0. Rating Protocol: Handle graded and survey rating interactions
  if (questionType === 'rating') {
    if (response === undefined || response === null) return false;
    
    // Survey Protocol: If no correct answer is set, award a point automatically for participation
    if (correctArr.length === 0) return true;

    const userRating = parseInt(String(response));
    const targetRating = parseInt(String(correctArr[0]));
    
    if (isNaN(userRating) || isNaN(targetRating)) return false;

    // Optional Tolerance Protocol: Award point if within ±1 star
    let hasTolerance = false;
    try {
      const meta = JSON.parse(q.metadata || "{}");
      hasTolerance = !!meta.tolerance;
    } catch (e) {}

    if (hasTolerance) {
      return Math.abs(userRating - targetRating) <= 1;
    }

    return userRating === targetRating;
  }

  // General Guard Protocol
  if (q.correct_answer === undefined && questionType !== 'hotspot') return false;
  if (response === undefined || response === null) return false;
  
  // 1. Choice Based (Single, T/F, Dropdown, Short Text)
  if (['singlechoice', 'oneanswer', 'truefalse', 'shorttext', 'dropdown'].includes(questionType)) {
    const userVal = String(response || "").trim().toLowerCase();
    const targetVal = String(correctArr[0] || "").trim().toLowerCase();
    return userVal === targetVal;
  } 
  
  // 2. Multiple Choice
  if (['multiplechoice', 'manyanswers'].includes(questionType)) {
    const resArr = (Array.isArray(response) ? response : []).map(r => String(r).trim().toLowerCase()).sort();
    const sortedCorrect = [...correctArr].map(c => String(c).trim().toLowerCase()).sort();
    return JSON.stringify(resArr) === JSON.stringify(sortedCorrect);
  } 
  
  // 3. Ordering
  if (questionType === 'ordering') {
    const responseArr = (Array.isArray(response) ? response : []).map(r => String(r).trim());
    const targetArr = [...correctArr].map(c => String(c).trim());
    return JSON.stringify(responseArr) === JSON.stringify(targetArr);
  } 
  
  // 4. Hotspot (Spatial)
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
  
  // 5. Matching
  if (questionType === 'matching') {
    const userPairs = Object.entries((response || {}) as Record<string, string>)
      .map(([k, v]) => `${String(k).trim()}|${String(v).trim()}`)
      .sort();
    
    const sortedCorrect = [...correctArr].map(c => String(c).trim()).sort();
    
    if (sortedCorrect.length !== userPairs.length) return false;
    return JSON.stringify(userPairs) === JSON.stringify(sortedCorrect);
  }

  // 6. Multiple True/False
  if (['multipletruefalse', 'multitf'].includes(questionType)) {
    const statements = parseRegistryArray(q.order_group);
    const userResp = (response || {}) as Record<string, string>;
    
    if (Object.keys(userResp).length !== statements.length) return false;

    return statements.every((s, i) => {
      const userVal = String(userResp[s] || "").trim().toLowerCase();
      const correctVal = String(correctArr[i] || "").trim().toLowerCase();
      return userVal === correctVal;
    });
  }

  // 7. Matrix Choice
  if (['matrixchoice', 'matrix'].includes(questionType)) {
    const rows = parseRegistryArray(q.order_group);
    const userResp = (response || {}) as Record<string, string>;

    if (Object.keys(userResp).length !== rows.length) return false;

    return rows.every((row, i) => {
      const userVal = String(userResp[row] || "").trim().toLowerCase();
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
