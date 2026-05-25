/**
 * @fileOverview Plain-Text Word Document Extraction Service.
 * 
 * Re-engineered for maximum performance and stability by utilizing a 
 * text-only extraction protocol. All visual assets are rendered as 
 * plain-text URLs to ensure zero-failure document assembly.
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table as DocxTable, 
  TableRow as DocxTableRow, 
  TableCell as DocxTableCell, 
  HeadingLevel, 
  AlignmentType, 
  WidthType,
  Header
} from "docx";
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';
import { Question } from '@/types/quiz';

interface ExportParams {
  testId: string;
  currentTest: any;
  questions: Question[];
  withAnswers: boolean;
  onStatus?: (status: string) => void;
  returnOutput?: boolean;
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
}

export async function generateTestWord({ testId, currentTest, questions, withAnswers, onStatus, returnOutput, watermark }: ExportParams) {
  const exportDate = new Date();
  const dateDisplay = exportDate.toLocaleDateString();
  const dateIso = exportDate.toISOString().split('T')[0];

  onStatus?.('Assembling document nodes...');

  const children: any[] = [
    new Paragraph({ 
      text: (currentTest.title || "Assessment Module").toUpperCase(), 
      heading: HeadingLevel.HEADING_1, 
      alignment: AlignmentType.CENTER, 
      spacing: { after: 200 } 
    }),
    new Paragraph({ 
      text: `${String(currentTest.category || "General").toUpperCase()} | ${String(currentTest.difficulty || "Medium").toUpperCase()}`, 
      heading: HeadingLevel.HEADING_3, 
      alignment: AlignmentType.CENTER, 
      spacing: { after: 400 } 
    }),
    new Paragraph({ 
      text: `Registry Date: ${dateDisplay}`, 
      alignment: AlignmentType.CENTER, 
      spacing: { after: 400 } 
    }),
    new DocxTable({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Duration", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
            new DocxTableCell({ children: [new Paragraph({ text: "Items", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
            new DocxTableCell({ children: [new Paragraph({ text: "Pass Threshold", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
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
    const options = parseRegistryArray(q.options || q.order_group);
    const correctArr = parseRegistryArray(q.correct_answer);

    children.push(new Paragraph({ text: `${i + 1}. ${q.question_text}`, heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Interaction: ${q.question_type.replace(/_/g, ' ')}`, italics: true, color: "94a3b8", size: 18 })], spacing: { after: 200 } }));

    if (q.image_url) {
      children.push(new Paragraph({ 
        children: [
          new TextRun({ text: "Visual Node: ", bold: true, color: "94a3b8", size: 18 }),
          new TextRun({ text: q.image_url, italics: true, color: "3B5BDB", size: 18 })
        ],
        spacing: { before: 100, after: 200 } 
      }));
    }

    if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
      options.forEach((opt, optIdx) => {
        const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
        children.push(new Paragraph({ 
          children: [
            new TextRun({ text: `${String.fromCharCode(65 + optIdx)}. ${opt}` }),
            ...(isCorrect ? [new TextRun({ text: " [CORRECT ✓]", bold: true, color: "059669" })] : [])
          ],
          bullet: { level: 0 }, 
          spacing: { before: 100 } 
        }));
      });
    } else if (qType === 'matching') {
      const tableRows = [
        new DocxTableRow({ 
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Subject", bold: true })], shading: { fill: "F1F5F9" } }), 
            new DocxTableCell({ children: [new Paragraph({ text: "Allocation", bold: true })], shading: { fill: "F1F5F9" } })
          ] 
        })
      ];

      parseRegistryArray(q.order_group).forEach(p => {
        const [l, r] = String(p).split('|').map(s => s.trim());
        const rightValue = withAnswers ? r : "";
        
        tableRows.push(new DocxTableRow({ 
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: l })] }), 
            new DocxTableCell({ children: [new Paragraph({ text: rightValue })] })
          ] 
        }));
      });
      children.push(new DocxTable({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
    } else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
      const rows = parseRegistryArray(q.order_group);
      const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
      const tableRows = [
        new DocxTableRow({ 
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Interaction", bold: true })], shading: { fill: "F1F5F9" } }), 
            ...cols.map(c => new DocxTableCell({ children: [new Paragraph({ text: c, bold: true, alignment: AlignmentType.CENTER })], shading: { fill: "F1F5F9" } }))
          ] 
        })
      ];
      rows.forEach((row, rIdx) => {
        tableRows.push(new DocxTableRow({ 
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: row })] }), 
            ...cols.map(col => new DocxTableCell({ 
              children: [new Paragraph({ text: withAnswers && compareValues(col, correctArr[rIdx]) ? "✓" : "", alignment: AlignmentType.CENTER })] 
            }))
          ] 
        }));
      });
      children.push(new DocxTable({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
    } else {
      children.push(new Paragraph({ text: "Registry Input: ________________________________________________", spacing: { before: 200 } }));
      if (withAnswers) {
        children.push(new Paragraph({ 
          children: [new TextRun({ text: `Correct Alignment: ${correctArr.join(", ")}`, bold: true, color: "059669" })], 
          spacing: { before: 100 } 
        }));
      }
    }
  });

  // WATERMARK CALIBRATION: Add watermark to the header of the section
  let header = undefined;
  if (watermark?.enabled && watermark.text) {
    // Calibrate color based on opacity tiers (Light, Medium, Dark)
    // 10% -> #EEEEEE, 20% -> #CCCCCC, 30% -> #AAAAAA
    let color = "EEEEEE";
    if (watermark.opacity >= 30) color = "AAAAAA";
    else if (watermark.opacity >= 20) color = "CCCCCC";

    header = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: watermark.text,
              color: color,
              size: 144, // Approx 72pt
              bold: true,
            })
          ],
          spacing: { before: 2000 } // Position down the page to simulate center
        })
      ]
    });
  }

  const doc = new Document({ 
    sections: [{ 
      headers: {
        default: header as any
      },
      children,
      footers: {
        default: new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `DNTRNG | Intelligence Extraction | Page `, size: 16 }),
            new TextRun({ children: ["PAGE_NUMBER"], size: 16 })
          ]
        })
      }
    }] 
  });
  
  const blob = await Packer.toBlob(doc);
  
  if (returnOutput) {
    onStatus?.('');
    return blob;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${withAnswers ? 'answerkey' : 'questions'}_${dateIso}.docx`;
  link.click();
  URL.revokeObjectURL(url);
  onStatus?.('');
}