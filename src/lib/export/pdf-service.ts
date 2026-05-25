/**
 * @fileOverview High-Fidelity PDF Intelligence Extraction Service.
 * Implements Visual Capture Protocol v19.5 with high-precision scaling.
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
  onStatus?: (status: string) => void;
}

/**
 * Builds the HTML content for a specific question node with only inline styles.
 * Bypasses Tailwind dependency for extraction reliability.
 */
function buildOptionsHTML(q: Question, showAnswers: boolean) {
  const qType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
  const options = parseRegistryArray(q.options || q.order_group);
  const correct = parseRegistryArray(q.correct_answer);

  if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
    return options.map((opt, idx) => {
      const label = String.fromCharCode(65 + idx);
      const isCorrect = showAnswers && correct.some(c => compareValues(c, opt));
      return `
        <div style="margin: 8px 0; padding: 8px 12px; font-size: 14px; color: ${isCorrect ? '#059669' : '#334155'}; border-radius: 8px; ${isCorrect ? 'font-weight: 900; background: #f0fdf4; border: 1px solid #bbf7d0;' : 'background: #f8fafc; border: 1px solid #f1f5f9;'}">
          <span style="color: ${isCorrect ? '#059669' : '#94a3b8'}; margin-right: 8px;">${label}.</span>
          ${opt} ${isCorrect ? '<span style="float: right;">✓</span>' : ''}
        </div>
      `;
    }).join('');
  }

  if (qType === 'matching') {
    let table = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; border: 1px solid #e2e8f0;">';
    table += '<tr style="background: #f1f5f9;"><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 900; text-transform: uppercase; color: #64748b;">Key Node</th><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 900; text-transform: uppercase; color: #64748b;">Allocation</th></tr>';
    parseRegistryArray(q.order_group).forEach(p => {
      const [l, r] = String(p).split('|').map(s => s.trim());
      // Proxy matching images too if needed, but usually these are text. If they are URLs, wrap them.
      const displayVal = (showAnswers && r.startsWith('http')) ? `<img src="/api/proxy/image?url=${encodeURIComponent(r)}" style="max-height: 50px;" />` : (showAnswers ? r : '____________________');
      
      table += `<tr><td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: 700; color: #1e293b; background: #ffffff;">${l}</td><td style="border: 1px solid #e2e8f0; padding: 12px; color: ${showAnswers ? '#059669' : '#cbd5e1'}; font-weight: ${showAnswers ? '900' : 'normal'}; background: #ffffff;">${displayVal}</td></tr>`;
    });
    table += '</table>';
    return table;
  }

  if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
    const rows = parseRegistryArray(q.order_group);
    const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
    let table = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; border: 1px solid #e2e8f0;">';
    table += `<tr style="background: #f1f5f9;"><th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-weight: 900; text-transform: uppercase; color: #64748b;">Interaction</th>${cols.map(c => `<th style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-weight: 900; text-transform: uppercase; color: #64748b;">${c}</th>`).join('')}</tr>`;
    rows.forEach((row, rIdx) => {
      table += `<tr><td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 700; color: #1e293b; background: #ffffff;">${row}</td>`;
      cols.forEach(col => {
        const isChecked = showAnswers && compareValues(col, correct[rIdx]);
        table += `<td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; background: #ffffff;">${isChecked ? '<span style="color: #059669; font-size: 20px; font-weight: bold;">●</span>' : '<span style="color: #e2e8f0; font-size: 20px;">○</span>'}</td>`;
      });
      table += '</tr>';
    });
    table += '</table>';
    return table;
  }

  return `
    <div style="margin: 15px 0; padding: 25px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; color: #94a3b8; font-size: 14px; font-weight: 500;">
      Response Registry: ____________________________________________________________________
    </div>
    ${showAnswers ? `<div style="margin-top: 12px; padding: 12px 20px; background: #f0fdf4; border-left: 5px solid #22c55e; color: #15803d; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">✓ Correct answer: ${correct.join(', ')}</div>` : ''}
  `;
}

export async function generateTestPDF({ testId, currentTest, questions, withAnswers, onStatus }: ExportParams) {
  console.log('[PDF] Starting high-fidelity export pulse');
  onStatus?.('Initializing renderer...');

  const element = document.createElement('div');
  element.id = 'pdf-render-node';
  
  // PROTOCOL: Technically visible but off-screen rendering
  element.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 794px;
    z-index: -100;
    opacity: 0;
    pointer-events: none;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 80px;
    box-sizing: border-box;
    color: #0f172a;
  `;

  const headerHtml = `
    <div style="text-align: center; margin-bottom: 80px;">
      <div style="font-size: 48px; font-weight: 900; color: #1e293b; margin-bottom: 8px; letter-spacing: -0.02em;">DNTRNG</div>
      <div style="font-size: 11px; font-weight: 800; color: #2563eb; letter-spacing: 0.4em; margin-bottom: 40px; text-transform: uppercase;">Intelligence Registry Protocol</div>
      <div style="width: 120px; height: 3px; background: #2563eb; margin: 0 auto 50px;"></div>
      <h1 style="font-size: 38px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; color: #0f172a;">${currentTest.title || "Assessment Module"}</h1>
      <div style="font-size: 15px; color: #64748b; font-weight: 600; display: flex; justify-content: center; gap: 20px;">
        <span>CATEGORY: ${String(currentTest.category || "General").toUpperCase()}</span>
        <span>|</span>
        <span>LEVEL: ${String(currentTest.difficulty || "Medium").toUpperCase()}</span>
        <span>|</span>
        <span>NODES: ${questions.length}</span>
      </div>
    </div>
  `;

  const questionsHtml = questions.map((q, i) => {
    // ROUTE THROUGH PROXY: Never fetch external URLs directly from the browser
    const proxiedImg = q.image_url ? `/api/proxy/image?url=${encodeURIComponent(q.image_url)}` : null;
    
    return `
      <div style="margin-bottom: 60px; page-break-inside: avoid; border-left: 6px solid #f1f5f9; padding-left: 30px;">
        <div style="display: flex; gap: 15px; margin-bottom: 12px;">
          <span style="font-size: 18px; font-weight: 900; color: #2563eb;">${i + 1}.</span>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.4;">${q.question_text}</div>
        </div>
        <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 25px;">
          Interaction: ${q.question_type.replace(/_/g, ' ')}
        </div>
        ${proxiedImg ? `<div style="margin-bottom: 25px;"><img src="${proxiedImg}" style="max-width: 100%; border: 1px solid #e2e8f0; border-radius: 0;" /></div>` : ''}
        ${buildOptionsHTML(q, withAnswers)}
      </div>
    `;
  }).join('');

  const footerHtml = `
    <div style="margin-top: 100px; text-align: center; border-top: 1px solid #f1f5f9; pt: 40px;">
      <p style="font-size: 9px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.4em;">
        Authorized Extraction • DNTRNG Platform v19.5 • ${new Date().toLocaleDateString()}
      </p>
    </div>
  `;

  element.innerHTML = headerHtml + questionsHtml + footerHtml;
  
  document.body.appendChild(element);

  onStatus?.('Hydrating assets...');
  // STEP: layout delay for browser rendering & image hydration via proxy
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    onStatus?.('Capturing visual registry...');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: element.scrollHeight,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      logging: false
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas capture failure');
    }

    onStatus?.('Generating PDF buffer...');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // SCALING: Pixel-to-PDF ratio
    const ratio = pdfWidth / (canvasWidth / 2); // Scale is 2
    const scaledHeight = (canvasHeight / 2) * ratio;

    let yPosition = 0;
    let remainingHeight = scaledHeight;

    // Distribution Sequence
    pdf.addImage(imgData, 'JPEG', 0, yPosition, pdfWidth, scaledHeight);
    remainingHeight -= pdfHeight;

    while (remainingHeight > 0) {
      yPosition -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, yPosition, pdfWidth, scaledHeight);
      remainingHeight -= pdfHeight;
    }

    const typeLabel = withAnswers ? "answerkey" : "questions";
    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${typeLabel}_${dateStr}.pdf`);
  } catch (error) {
    console.error('[PDF] Extraction failed:', error);
    throw error;
  } finally {
    document.body.removeChild(element);
  }
}
