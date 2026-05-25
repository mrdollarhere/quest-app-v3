/**
 * @fileOverview High-Fidelity Word Document Extraction Service.
 */

import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, HeadingLevel, AlignmentType, WidthType } from "docx";
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';
import { Question } from '@/types/quiz';

interface ExportParams {
  testId: string;
  currentTest: any;
  questions: Question[];
  withAnswers: boolean;
}

export async function generateTestWord({ testId, currentTest, questions, withAnswers }: ExportParams) {
  const dateStr = new Date().toLocaleDateString();
  const children: any[] = [
    new Paragraph({ text: currentTest.title || "Assessment Module", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ text: `${currentTest.category || "General"} | ${currentTest.difficulty || "Medium"}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new DocxTable({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Duration", alignment: AlignmentType.CENTER })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Nodes", alignment: AlignmentType.CENTER })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Pass Score", alignment: AlignmentType.CENTER })] }),
          ]
        }),
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: currentTest.duration || "15m", alignment: AlignmentType.CENTER })] }),
            new DocxTableCell({ children: [new Paragraph({ text: String(questions.length), alignment: AlignmentType.CENTER })] }),
            new DocxTableCell({ children: [new Paragraph({ text: `${currentTest.passing_threshold || 70}%`, alignment: AlignmentType.CENTER })] }),
          ]
        })
      ],
      spacing: { after: 600 }
    })
  ];

  questions.forEach((q, i) => {
    const qType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
    const correctArr = parseRegistryArray(q.correct_answer);

    children.push(new Paragraph({ text: `${i + 1}. ${q.question_text}`, heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Module: ${q.question_type}`, italics: true, color: "94a3b8", size: 18 })], spacing: { after: 200 } }));

    if (q.image_url) {
      children.push(new Paragraph({ children: [new TextRun({ text: "[Image: see online version for visual asset]", italics: true, color: "cbd5e1", size: 16 })], spacing: { after: 200 } }));
    }

    if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
      parseRegistryArray(q.options || q.order_group).forEach((opt) => {
        const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
        children.push(new Paragraph({ text: `${opt}${isCorrect ? " [CORRECT ✓]" : ""}`, bullet: { level: 0 }, spacing: { before: 100 } }));
      });
    } else if (qType === 'matching') {
      const rows = [new DocxTableRow({ children: [new DocxTableCell({ children: [new Paragraph({ text: "Key Node", bold: true })] }), new DocxTableCell({ children: [new Paragraph({ text: "Allocation", bold: true })] })] })];
      parseRegistryArray(q.order_group).forEach(p => {
        const [l, r] = String(p).split('|').map(s => s.trim());
        rows.push(new DocxTableRow({ children: [new DocxTableCell({ children: [new Paragraph({ text: l })] }), new DocxTableCell({ children: [new Paragraph({ text: withAnswers ? r : "" })] })] }));
      });
      children.push(new DocxTable({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
    } else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
      const rows = parseRegistryArray(q.order_group);
      const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
      const tableRows = [new DocxTableRow({ children: [new DocxTableCell({ children: [new Paragraph({ text: "Interaction", bold: true })] }), ...cols.map(c => new DocxTableCell({ children: [new Paragraph({ text: c, bold: true, alignment: AlignmentType.CENTER })] }))] })];
      rows.forEach((row, rIdx) => {
        tableRows.push(new DocxTableRow({ children: [new DocxTableCell({ children: [new Paragraph({ text: row })] }), ...cols.map(col => new DocxTableCell({ children: [new Paragraph({ text: withAnswers && compareValues(col, correctArr[rIdx]) ? "✓" : "", alignment: AlignmentType.CENTER })] }))] }));
      });
      children.push(new DocxTable({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
    } else {
      children.push(new Paragraph({ text: "________________________________________________", spacing: { before: 200 } }));
      if (withAnswers) children.push(new Paragraph({ children: [new TextRun({ text: `Correct Answer: ${correctArr.join(", ")}`, bold: true, color: "059669" })], spacing: { before: 100 } }));
    }
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${withAnswers ? 'answerkey' : 'questions'}_${new Date().toISOString().split('T')[0]}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}
