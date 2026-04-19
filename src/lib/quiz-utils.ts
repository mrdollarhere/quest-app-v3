import { Question, HotspotZone } from '@/types/quiz';

/**
 * Fisher-Yates shuffle algorithm for stable randomization.
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
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
 */
export const calculateScoreForQuestion = (q: Question, response: any): boolean => {
  if (q.correct_answer === undefined && q.question_type !== 'hotspot') return false;
  if (response === undefined || response === null) return false;
  
  const questionType = q.question_type;
  const correctArr = parseRegistryArray(q.correct_answer);

  if (['single_choice', 'true_false', 'short_text', 'dropdown'].includes(questionType)) {
    const target = correctArr[0] || "";
    return response.toString().toLowerCase().trim() === target.toLowerCase().trim();
  } 
  
  if (questionType === 'multiple_choice') {
    const resArr = (Array.isArray(response) ? response : []).map((r: any) => r.toString().trim().toLowerCase()).sort();
    const sortedCorrect = [...correctArr].map(c => c.toLowerCase()).sort();
    return JSON.stringify(resArr) === JSON.stringify(sortedCorrect);
  } 
  
  if (questionType === 'ordering') {
    const responseArr = (Array.isArray(response) ? response : []).map((r: any) => r.toString().trim());
    return JSON.stringify(responseArr) === JSON.stringify(correctArr);
  } 
  
  if (questionType === 'hotspot') {
    try {
      const zones: HotspotZone[] = JSON.parse(q.metadata || "[]");
      const correctZoneIds = zones.filter(z => z.isCorrect).map(z => z.id).sort();
      
      // Support for both legacy single-coord and new multi-selection (array of IDs)
      if (Array.isArray(response)) {
        const selectedIds = [...response].sort();
        return JSON.stringify(selectedIds) === JSON.stringify(correctZoneIds);
      } else if (response && typeof response === 'object' && 'x' in response) {
        // Legacy single selection fallback
        const hit = zones.find((z: HotspotZone) => {
          const x = z.x;
          const y = z.y;
          const w = z.width || ((z as any).radius * 2);
          const h = z.height || ((z as any).radius * 2);
          return response.x >= x && response.x <= x + w &&
                 response.y >= y && response.y <= y + h;
        });
        return !!hit && !!hit.isCorrect && correctZoneIds.length === 1;
      }
      return false;
    } catch (e) { return false; }
  } 
  
  if (questionType === 'matching') {
    const userPairs = Object.entries(response as Record<string, string>)
      .map(([k, v]) => `${k.trim()}|${v.trim()}`)
      .sort();
    
    const sortedCorrect = [...correctArr].map(c => c.trim()).sort();
    
    if (sortedCorrect.length !== userPairs.length) return false;
    return JSON.stringify(userPairs) === JSON.stringify(sortedCorrect);
  }

  if (questionType === 'multiple_true_false') {
    const statements = parseRegistryArray(q.order_group);
    const userResp = response as Record<string, string>;
    
    return statements.every((s, i) => {
      const userVal = (userResp[s] || "").toLowerCase();
      const correctVal = (correctArr[i] || "").toLowerCase();
      return userVal === correctVal;
    });
  }

  if (questionType === 'matrix_choice') {
    const rows = parseRegistryArray(q.order_group);
    const userResp = response as Record<string, string>;

    return rows.every((row, i) => {
      const userVal = (userResp[row] || "").toLowerCase();
      const correctVal = (correctArr[i] || "").toLowerCase();
      return userVal === correctVal;
    });
  }
  
  return false;
};

/**
 * Calculates the total score for a set of responses.
 */
export const calculateTotalScore = (questions: Question[], responses: { questionId: string; answer: any }[]): number => {
  let score = 0;
  questions.forEach(q => {
    const response = responses.find(r => r.questionId === q.id)?.answer;
    if (calculateScoreForQuestion(q, response)) score++;
  });
  return score;
};
