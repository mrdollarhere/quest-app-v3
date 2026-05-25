/**
 * @fileOverview Excel and JSON Extraction Service.
 */

import * as XLSX from 'xlsx';
import { Question } from '@/types/quiz';

interface ExportParams {
  testId: string;
  currentTest: any;
  questions: Question[];
}

export function generateTestExcel({ testId, currentTest, questions }: ExportParams) {
  const dateStr = new Date().toISOString().split('T')[0];
  const infoAOA = [
    ["Field", "Value"],
    ["Title", currentTest.title || "N/A"],
    ["Category", currentTest.category || "General"],
    ["Difficulty", currentTest.difficulty || "Medium"],
    ["Duration", currentTest.duration || "15m"],
    ["Questions", questions.length],
    ["Exported At", new Date().toLocaleString()]
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoAOA);
  wsInfo['!cols'] = [{ wch: 20 }, { wch: 50 }];

  const questionsData = questions.map((q, i) => ({
    "No.": i + 1,
    "Question": q.question_text,
    "Type": q.question_type,
    "Options": q.options || "[]",
    "Correct Answer": q.correct_answer || "[]",
    "Image URL": q.image_url || "",
    "Required": q.required ? "yes" : "no"
  }));
  const wsQuestions = XLSX.utils.json_to_sheet(questionsData);
  wsQuestions['!cols'] = [{ wch: 5 }, { wch: 60 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 40 }, { wch: 10 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsInfo, "Test Info");
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${dateStr}.xlsx`;
  link.click();
}

export function generateTestJSON({ testId, currentTest, questions }: ExportParams) {
  const typeDistribution: Record<string, number> = {};
  questions.forEach(q => { const t = q.question_type || 'unknown'; typeDistribution[t] = (typeDistribution[t] || 0) + 1; });
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    platform: "DNTRNG",
    test: { ...currentTest },
    questions: questions.map(q => ({ ...q })),
    summary: { totalQuestions: questions.length, questionTypes: typeDistribution }
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `DNTRNG_${testId}_${dateStr}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
