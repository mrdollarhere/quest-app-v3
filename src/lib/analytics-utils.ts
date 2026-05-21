/**
 * Centralized analytics utilities for DNTRNG™ Assessment Data.
 */

export interface ResponseStats {
  total: number;
  avgScore: number;
  passRate: number;
  gradeData: { name: string; value: number; color: string }[];
  testPerformanceData: { name: string; avg: number; submissions: number }[];
}

export interface QuestionStat {
  id: string;
  text: string;
  attempts: number;
  correct: number;
  incorrect: number;
  successRate: number;
}

/**
 * Calculates global and per-test metrics from raw response data.
 * @param responses - The list of submission records.
 * @param tests - The list of assessment modules.
 * @param threshold - The percentage required to pass (default 70).
 */
export function calculateResponseStats(responses: any[], tests: any[], threshold: number = 70): ResponseStats | null {
  if (!responses || !Array.isArray(responses) || responses.length === 0) return null;

  const total = responses.length;
  let totalScorePct = 0;
  let passes = 0;

  const gradeCounts = {
    Excellent: 0,
    Pass: 0,
    Fail: 0
  };

  const testStats: Record<string, { count: number; totalScore: number }> = {};

  responses.forEach(r => {
    const score = Number(r.Score) || 0;
    const totalQ = Number(r.Total) || 1;
    const pct = (score / totalQ) * 100;
    
    totalScorePct += pct;
    
    // Pass rate logic uses the dynamic system threshold
    if (pct >= threshold) passes++;
    
    // Grade distribution logic uses fixed professional tiers per Protocol v18.6
    if (pct >= 80) gradeCounts.Excellent++;
    else if (pct >= 50) gradeCounts.Pass++;
    else gradeCounts.Fail++;

    const testId = String(r['Test ID'] || 'Unknown').trim();
    if (!testStats[testId]) testStats[testId] = { count: 0, totalScore: 0 };
    testStats[testId].count++;
    testStats[testId].totalScore += pct;
  });

  const gradeData = [
    { name: `Excellent (80%+)`, value: gradeCounts.Excellent, color: '#22C55E' },
    { name: `Pass (50-79%)`, value: gradeCounts.Pass, color: '#F59E0B' },
    { name: `Fail (<50%)`, value: gradeCounts.Fail, color: '#EF4444' }
  ];

  const testPerformanceData = Object.entries(testStats).map(([id, data]) => {
    const test = (tests || []).find(t => String(t.id).trim() === id);
    return {
      name: test?.title || id,
      avg: Math.round(data.totalScore / data.count),
      submissions: data.count
    };
  }).sort((a, b) => b.avg - a.avg);

  return {
    total,
    avgScore: Math.round(totalScorePct / total),
    passRate: Math.round((passes / total) * 100),
    gradeData,
    testPerformanceData
  };
}

/**
 * Calculates per-question metrics for a specific test.
 */
export function calculateQuestionStats(testId: string, questions: any[], allResponses: any[]): QuestionStat[] {
  if (!questions || !Array.isArray(questions)) return [];
  
  // TACTICAL FILTERING: Match responses to the specific module with trimmed keys
  const targetId = String(testId).trim();
  const testResponses = (allResponses || []).filter(r => 
    String(r['Test ID'] || '').trim() === targetId
  );
  
  return questions.map(q => {
    let attempts = 0;
    let correct = 0;

    testResponses.forEach(r => {
      try {
        const rawData = r['Raw Responses'];
        let raw = [];
        
        if (typeof rawData === 'string') {
          try {
            const parsed = JSON.parse(rawData || '[]');
            // Handle double-stringification if present
            raw = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
          } catch (e) {
            raw = [];
          }
        } else {
          raw = rawData || [];
        }
        
        if (Array.isArray(raw)) {
          const qIdStr = String(q.id).trim();
          const qResponse = raw.find((item: any) => 
            String(item.questionId || '').trim() === qIdStr
          );
          
          if (qResponse) {
            attempts++;
            if (qResponse.isCorrect === true || String(qResponse.isCorrect).toUpperCase() === "TRUE") {
              correct++;
            }
          }
        }
      } catch (e) {
        // Skip malformed response nodes
      }
    });

    const successRate = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    return {
      id: q.id,
      text: q.question_text || 'Unknown Question',
      attempts,
      correct,
      incorrect: attempts - correct,
      successRate
    };
  }).sort((a, b) => a.successRate - b.successRate); // Hardest nodes prioritized
}
