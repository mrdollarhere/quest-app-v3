/**
 * @fileOverview High-Fidelity PDF Intelligence Extraction Service.
 * Implements Direct Text Protocol v2.0 using jsPDF for reliability.
 */

import { jsPDF } from 'jspdf';
import { Question } from '@/types/quiz';
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';

interface ExportParams {
  testId: string;
  currentTest: any;
  questions: Question[];
  withAnswers: boolean;
  onStatus?: (status: string) => void;
}

/**
 * LINGUISTIC NORMALIZATION HELPER
 * Replaces Vietnamese diacritics with ASCII equivalents for standard font compatibility.
 */
function toAscii(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
    'ă':'a','ắ':'a','ặ':'a','ằ':'a','ẳ':'a','ẵ':'a',
    'â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
    'ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e',
    'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
    'ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
    'ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u',
    'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
    'đ':'d',
    'À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A',
    'Ă':'A','Ắ':'A','Ặ':'A','Ằ':'A','Ẳ':'A','Ẵ':'A',
    'Â':'A','Ấ':'A','Ầ':'A','Ẩ':'A','Ẫ':'A','Ậ':'A',
    'È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E',
    'Ê':'E','Ế':'E','Ề':'E','Ể':'E','Ễ':'E','Ệ':'E',
    'Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I',
    'Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O',
    'Ô':'O','Ố':'O','Ồ':'O','Ổ':'O','Ỗ':'O','Ộ':'O',
    'Ơ':'O','Ớ':'O','Ờ':'O','Ở':'O','Ỡ':'O','Ợ':'O',
    'Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U',
    'Ư':'U','Ứ':'U','Ừ':'U','Ử':'U','Ữ':'U','Ự':'U',
    'Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y',
    'Đ':'D'
  };
  return text.split('').map(char => map[char] || char).join('').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function generateTestPDF({ testId, currentTest, questions, withAnswers, onStatus }: ExportParams) {
  onStatus?.('Generating document buffer...');

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const usableWidth = 170;
  let y = 30;

  // PAGE 1: COVER
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const titleText = toAscii(currentTest.title || "Assessment Module");
  const splitTitle = pdf.splitTextToSize(titleText, usableWidth);
  pdf.text(splitTitle, margin, y);
  y += (splitTitle.length * 8) + 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Category: ${toAscii(currentTest.category || "General")}`, margin, y);
  y += 7;
  pdf.text(`Difficulty: ${toAscii(currentTest.difficulty || "Medium")} | Duration: ${toAscii(currentTest.duration || "15m")}`, margin, y);
  y += 7;
  pdf.text(`Questions: ${questions.length}`, margin, y);
  y += 7;
  pdf.text(`Exported: ${new Date().toLocaleDateString()}`, margin, y);
  y += 10;

  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 15;

  // PAGES 2+: QUESTIONS
  questions.forEach((q, i) => {
    const qTypeRaw = String(q.question_type || '');
    const qTypeNormalized = qTypeRaw.toLowerCase().replace(/[\s_]/g, '');
    const options = parseRegistryArray(q.options || q.order_group);
    const correctArr = parseRegistryArray(q.correct_answer);

    // Calculate required height for this question block estimate to trigger early page breaks
    const estHeight = 40 + (options.length * 7);
    if (y + estHeight > 280) {
      pdf.addPage();
      y = 20;
    }

    // Question Number + Text
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const qLabel = `${i + 1}. `;
    const qText = toAscii(q.question_text);
    const splitQ = pdf.splitTextToSize(qText, usableWidth - 12);
    
    pdf.text(qLabel, margin, y);
    pdf.text(splitQ, margin + 12, y);
    y += (splitQ.length * 6) + 2;

    // Type Descriptor
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(150, 150, 150);
    pdf.text(`[${qTypeRaw.replace(/_/g, ' ').toUpperCase()}]`, margin + 12, y);
    pdf.setTextColor(0, 0, 0);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Layout by interaction type
    if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown'].includes(qTypeNormalized)) {
      options.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
        const optText = `${letter}. ${toAscii(opt)} ${isCorrect ? "[CORRECT]" : ""}`;
        const wrapped = pdf.splitTextToSize(optText, usableWidth - 15);
        
        if (y + (wrapped.length * 6) > 285) { pdf.addPage(); y = 20; }
        
        if (isCorrect) pdf.setTextColor(0, 128, 0);
        pdf.text(wrapped, margin + 15, y);
        pdf.setTextColor(0, 0, 0);
        y += (wrapped.length * 6) + 1;
      });
    } else if (qTypeNormalized === 'truefalse') {
        const isTrueCorrect = withAnswers && compareValues('True', correctArr[0]);
        const isFalseCorrect = withAnswers && compareValues('False', correctArr[0]);
        pdf.text(`[${isTrueCorrect ? 'X' : ' '}] TRUE    [${isFalseCorrect ? 'X' : ' '}] FALSE`, margin + 15, y);
        y += 8;
    } else if (qTypeNormalized === 'matching') {
        parseRegistryArray(q.order_group).forEach(p => {
          const [l, r] = String(p).split('|').map(s => s.trim());
          const matchText = `${toAscii(l)}  ->  ${withAnswers ? toAscii(r) : '________________'}`;
          const wrapped = pdf.splitTextToSize(matchText, usableWidth - 15);
          if (y + (wrapped.length * 6) > 285) { pdf.addPage(); y = 20; }
          pdf.text(wrapped, margin + 15, y);
          y += (wrapped.length * 6) + 1;
        });
    } else if (qTypeNormalized === 'matrixchoice' || qTypeNormalized === 'multipletruefalse') {
        const rows = parseRegistryArray(q.order_group);
        rows.forEach((row, rIdx) => {
            const rowText = `${toAscii(row)}: ${withAnswers ? toAscii(correctArr[rIdx]) : '________________'}`;
            const wrapped = pdf.splitTextToSize(rowText, usableWidth - 15);
            if (y + (wrapped.length * 6) > 285) { pdf.addPage(); y = 20; }
            pdf.text(wrapped, margin + 15, y);
            y += (wrapped.length * 6) + 1;
        });
    } else if (qTypeNormalized === 'ordering') {
        const displayItems = withAnswers ? correctArr : options;
        displayItems.forEach((item, idx) => {
            const itemText = `${idx + 1}. ${toAscii(item)}`;
            const wrapped = pdf.splitTextToSize(itemText, usableWidth - 15);
            if (y + (wrapped.length * 6) > 285) { pdf.addPage(); y = 20; }
            pdf.text(wrapped, margin + 15, y);
            y += (wrapped.length * 6) + 1;
        });
    } else if (qTypeNormalized === 'shorttext') {
        pdf.text(`Answer: ${withAnswers ? toAscii(correctArr[0] || "") : "________________________"}`, margin + 15, y);
        y += 8;
    } else {
        pdf.text("Registry Input Required: ________________________", margin + 15, y);
        if (withAnswers && correctArr.length > 0) {
            y += 6;
            pdf.setTextColor(0, 128, 0);
            pdf.text(`Target: ${toAscii(correctArr.join(', '))}`, margin + 15, y);
            pdf.setTextColor(0, 0, 0);
        }
        y += 8;
    }

    y += 12;
  });

  // FINALIZATION: PAGE NUMBERS & SAVING
  const totalPages = pdf.internal.getNumberOfPages();
  const testTitleNormalized = toAscii(currentTest.title || "Test");
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
    pdf.text(testTitleNormalized, margin, pageHeight - 12);
  }

  const typeLabel = withAnswers ? "answerkey" : "questions";
  const dateStr = new Date().toISOString().split('T')[0];
  pdf.save(`DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${typeLabel}_${dateStr}.pdf`);
  onStatus?.('');
}
