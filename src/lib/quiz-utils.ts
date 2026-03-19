
import { Question } from '@/types/quiz';

/**
 * Calculates whether a user's response is correct for a given question.
 */
export const calculateScoreForQuestion = (q: Question, response: any): boolean => {
  if (q.correct_answer === undefined || q.correct_answer === null || response === undefined || response === null) return false;
  
  const questionType = q.question_type;
  const correctAnswerStr = q.correct_answer.toString();

  if (['single_choice', 'true_false', 'short_text', 'dropdown'].includes(questionType)) {
    return response.toString().toLowerCase().trim() === correctAnswerStr.toLowerCase().trim();
  } 
  
  if (questionType === 'multiple_choice') {
    const resArr = (Array.isArray(response) ? response : []).map((r: any) => r.toString().trim().toLowerCase()).sort();
    const correctArr = correctAnswerStr.split(',').map(c => c.trim().toLowerCase()).sort();
    return JSON.stringify(resArr) === JSON.stringify(correctArr);
  } 
  
  if (questionType === 'ordering') {
    const correctArr = correctAnswerStr.split(',').map(c => c.trim());
    const responseArr = (Array.isArray(response) ? response : []).map((r: any) => r.toString().trim());
    return JSON.stringify(responseArr) === JSON.stringify(correctArr);
  } 
  
  if (questionType === 'hotspot') {
    try {
      const zones = JSON.parse(q.metadata || "[]");
      const hit = zones.find((z: any) => {
        const dist = Math.sqrt(Math.pow(response.x - z.x, 2) + Math.pow(response.y - z.y, 2));
        return dist <= z.radius;
      });
      return !!hit;
    } catch (e) { return false; }
  } 
  
  if (questionType === 'matching') {
    const correctPairs = correctAnswerStr.split(',').map(p => p.trim());
    const userPairs = Object.entries(response as Record<string, string>).map(([k, v]) => `${k}|${v}`);
    if (correctPairs.length !== userPairs.length) return false;
    return correctPairs.every(cp => userPairs.includes(cp));
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
