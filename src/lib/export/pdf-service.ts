/**
 * @fileOverview High-Fidelity PDF Intelligence Extraction Service.
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';
import { Question } from '@/types/quiz';

interface ExportParams {
  testId: string;
  currentTest: any;
  questions: Question[];
  withAnswers: boolean;
  onProgress?: (msg: string) => void;
}

export async function generateTestPDF({ testId, currentTest, questions, withAnswers }: ExportParams) {
  const element = document.createElement('div');
  element.id = 'pdf-render-node';
  element.style.width = '794px';
  element.style.padding = '60px';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#0f172a';
  element.style.fontFamily = '"Inter", sans-serif';
  element.style.position = 'absolute';
  element.style.left = '-9999px';

  let html = `
    <div style="text-align: center; margin-bottom: 60px;">
      <div style="font-size: 42px; font-weight: 900; color: #1e293b; margin-bottom: 8px;">DNTRNG</div>
      <div style="font-size: 11px; font-weight: 800; color: #3b82f6; letter-spacing: 0.4em; margin-bottom: 40px; text-transform: uppercase;">Intelligence Registry Protocol</div>
      <div style="width: 120px; height: 2px; background: #3b82f6; margin: 0 auto 50px;"></div>
      <h1 style="font-size: 36px; font-weight: 900; line-height: 1.2; margin-bottom: 30px; color: #0f172a;">${currentTest.title || "Assessment Module"}</h1>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 16px; color: #64748b; font-weight: 500;">
        <div>Category: ${currentTest.category || "General"}</div>
        <div>Difficulty: ${currentTest.difficulty || "Medium"}</div>
        <div>Duration: ${currentTest.duration || "15m"}</div>
        <div>Export Type: ${withAnswers ? "Answer Key / Đáp án" : "Questions Only / Chỉ câu hỏi"}</div>
      </div>
    </div>
  `;

  questions.forEach((q, i) => {
    const qType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
    const options = parseRegistryArray(q.options || q.order_group);
    const correctArr = parseRegistryArray(q.correct_answer);

    html += `
      <div style="margin-bottom: 50px; page-break-inside: avoid; border-left: 4px solid #f1f5f9; padding-left: 24px;">
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 18px; font-weight: 900; color: #3b82f6;">${i + 1}.</span>
          <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${q.question_text}</div>
        </div>
        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 20px;">
          Module: ${q.question_type.replace(/_/g, ' ')}
        </div>
    `;

    if (q.image_url) {
      html += `<div style="margin-bottom: 20px;"><img src="${q.image_url}" style="max-width: 100%; max-height: 300px; border: 1px solid #e2e8f0; border-radius: 0;" /></div>`;
    }

    if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
      options.forEach((opt, idx) => {
        const label = String.fromCharCode(65 + idx);
        const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
        html += `
          <div style="display: flex; align-items: flex-start; gap: 12px; font-size: 15px; margin-bottom: 8px; ${isCorrect ? 'color: #059669; font-weight: 700;' : 'color: #475569;'}">
            <span style="font-weight: 800; color: ${isCorrect ? '#059669' : '#cbd5e1'}; min-width: 24px;">${label}.</span>
            <span>${opt} ${isCorrect ? '✓' : ''}</span>
          </div>
        `;
      });
    } else if (qType === 'matching') {
      html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">';
      html += '<tr style="background: #f8fafc;"><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Key Node</th><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Allocation</th></tr>';
      parseRegistryArray(q.order_group).forEach(p => {
        const [l, r] = String(p).split('|').map(s => s.trim());
        html += `<tr><td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: 600;">${l}</td><td style="border: 1px solid #e2e8f0; padding: 12px; color: ${withAnswers ? '#059669' : '#cbd5e1'};">${withAnswers ? r : '____________________'}</td></tr>`;
      });
      html += '</table>';
    } else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
      const rows = parseRegistryArray(q.order_group);
      const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
      html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">';
      html += `<tr style="background: #f8fafc;"><th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left;">Interaction</th>${cols.map(c => `<th style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">${c}</th>`).join('')}</tr>`;
      rows.forEach((row, rIdx) => {
        html += `<tr><td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 600;">${row}</td>`;
        cols.forEach(col => {
          const isChecked = withAnswers && compareValues(col, correctArr[rIdx]);
          html += `<td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">${isChecked ? '<span style="color: #059669; font-size: 18px;">●</span>' : '<span style="color: #e2e8f0; font-size: 18px;">○</span>'}</td>`;
        });
        html += '</tr>';
      });
      html += '</table>';
    } else {
      html += '<div style="margin-bottom: 20px; padding: 20px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 0; color: #94a3b8; font-size: 14px;">Response: ________________________________________________</div>';
      if (withAnswers) {
        html += `<div style="color: #059669; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 8px;"><span style="background: #ecfdf5; padding: 4px 10px;">✓ Correct: ${correctArr.join(', ')}</span></div>`;
      }
    }
    html += '</div>';
  });

  element.innerHTML = html;
  document.body.appendChild(element);
  await new Promise(resolve => setTimeout(resolve, 500));

  const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
  document.body.removeChild(element);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  const typeLabel = withAnswers ? "answerkey" : "questions";
  pdf.save(`DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${typeLabel}_${new Date().toISOString().split('T')[0]}.pdf`);
}
