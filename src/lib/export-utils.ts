/**
 * @fileOverview Intelligence Assembly Engine
 * 
 * Purpose: Specialized logic for preparing assessment data for extraction.
 * Features: Difficulty filtering, random sampling, and version-based shuffling.
 */

import { Question } from '@/types/quiz';
import { parseRegistryArray, shuffleArray } from './quiz-utils';

/**
 * Filters the question registry based on selected difficulty tiers.
 * 
 * @param questions - The source question nodes.
 * @param difficulties - Array of approved difficulty labels (e.g., ['Easy', 'Hard']).
 * @returns Filtered question array.
 */
export function filterQuestions(questions: Question[], difficulties: string[]): Question[] {
  if (!difficulties || difficulties.length === 0) return questions;
  
  // If all standard difficulties are selected, return all
  if (difficulties.length >= 3) return questions;

  return questions.filter(q => {
    // Note: difficulty may be a custom field not in the base type but present in the registry
    const qDiff = (q as any).difficulty;
    if (!qDiff) return true; // Include nodes without difficulty metadata by default
    return difficulties.includes(qDiff);
  });
}

/**
 * Performs a random selection of a specific number of questions.
 * Implements the Fisher-Yates shuffle for high-entropy randomization.
 * 
 * @param questions - The filtered question nodes.
 * @param count - Total items to return or 'all'.
 * @returns Shuffled subset of questions.
 */
export function selectQuestions(questions: Question[], count: number | 'all'): Question[] {
  if (count === 'all' || count >= questions.length) return questions;
  
  const shuffled = shuffleArray([...questions]);
  return shuffled.slice(0, count);
}

/**
 * Re-aligns internal interaction nodes (options/rows) for a single question.
 * Ensures that correct_answer registry remains valid after shuffling.
 * 
 * @param question - The source question object.
 * @returns A new question object with randomized internal sequence.
 */
export function shuffleOptions(question: Question): Question {
  const qType = String(question.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const newQ = { ...question };

  try {
    // 1. CHOICE PROTOCOL (Single/Multiple/Dropdown)
    if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown'].includes(qType)) {
      const options = parseRegistryArray(question.options);
      if (options.length > 1) {
        newQ.options = JSON.stringify(shuffleArray(options));
        // correct_answer stays the same as it maps to values, not indices
      }
    } 
    
    // 2. GRID PROTOCOL (Matrix/Multiple T-F)
    else if (['matrixchoice', 'multipletruefalse', 'multitf'].includes(qType)) {
      const rows = parseRegistryArray(question.order_group);
      const answers = parseRegistryArray(question.correct_answer);
      
      if (rows.length > 1) {
        // Zip rows and answers to maintain logic alignment
        const pairs = rows.map((r, i) => ({ row: r, ans: answers[i] }));
        const shuffledPairs = shuffleArray(pairs);
        
        newQ.order_group = JSON.stringify(shuffledPairs.map(p => p.row));
        newQ.correct_answer = JSON.stringify(shuffledPairs.map(p => p.ans));
      }
    }
    
    // 3. ASSOCIATION PROTOCOL (Matching)
    else if (qType === 'matching') {
      const pairs = parseRegistryArray(question.order_group);
      if (pairs.length > 1) {
        newQ.order_group = JSON.stringify(shuffleArray(pairs));
        newQ.correct_answer = newQ.order_group;
      }
    }

    // 4. SEQUENCE PROTOCOL (Ordering)
    // Note: We do NOT shuffle the correct_answer. The goal is to provide the target sequence.
    // The visual shuffling is handled by the rendering layer in the terminal.

  } catch (e) {
    console.warn('[Assembly Engine] Shuffle failed for node:', question.id, e);
  }

  return newQ;
}

/**
 * Generates a single unique version of the assessment.
 * 
 * @param questions - The approved question pool.
 * @param versionLabel - Character label (A, B, C...).
 * @param shuffleQ - Whether to randomize question sequence.
 * @param shuffleOpts - Whether to randomize internal option sequence.
 */
export function generateVersion(
  questions: Question[], 
  versionLabel: string, 
  shuffleQ: boolean, 
  shuffleOpts: boolean
): { label: string, questions: Question[] } {
  let processed = [...questions];

  if (shuffleQ) {
    processed = shuffleArray(processed);
  }

  if (shuffleOpts) {
    processed = processed.map(q => shuffleOptions(q));
  }

  return {
    label: `Version ${versionLabel}`,
    questions: processed
  };
}

/**
 * Orchestrates the creation of multiple independent assessment versions.
 * 
 * @param questions - The source question pool.
 * @param count - Number of versions to generate (Max 26).
 * @param shuffleQ - Global question shuffle toggle.
 * @param shuffleOpts - Global option shuffle toggle.
 */
export function generateAllVersions(
  questions: Question[],
  count: number,
  shuffleQ: boolean,
  shuffleOpts: boolean
) {
  const versions = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < Math.min(count, 26); i++) {
    versions.push(generateVersion(questions, alphabet[i], shuffleQ, shuffleOpts));
  }

  return versions;
}
