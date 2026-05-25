/**
 * @fileOverview High-Fidelity Word Document Extraction Service.
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
  ImageRun
} from "docx";
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
 * IDENTITY HANDSHAKE: Image Fetcher
 * Converts a remote asset URL into a byte array for Word embedding.
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string, type: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const data = base64.split(',')[1];
        const type = blob.type || 'image/png';
        resolve({ data, type });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * PROTOCOL: Image Signature Matcher
 * Identifies if a registry value represents a visual asset URL.
 */
function isImageUrl(value: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return (
    (lower.startsWith('http://') || lower.startsWith('https://')) &&
    (lower.endsWith('.png') || 
     lower.endsWith('.jpg') || 
     lower.endsWith('.jpeg') || 
     lower.endsWith('.gif') || 
     lower.endsWith('.webp') ||
     lower.includes('postimg.cc') ||
     lower.includes('imgur.com') ||
     lower.includes('cloudinary.com') ||
     lower.includes('supabase.co'))
  );
}

export async function generateTestWord({ testId, currentTest, questions, withAnswers, onStatus }: ExportParams) {
  const exportDate = new Date();
  const dateDisplay = exportDate.toLocaleDateString();
  const dateIso = exportDate.toISOString().split('T')[0];

  // PRE-FETCH PROTOCOL: Parallel image resolution for matching values
  const imageCache = new Map<string, { data: string, type: string } | null>();
  const imageUrlsToFetch: string[] = [];

  if (withAnswers) {
    questions.forEach(q => {
      if (q.question_type === 'matching') {
        const pairsArr = parseRegistryArray(q.order_group);
        pairsArr.forEach(p => {
          const parts = String(p).split('|');
          const val = parts[1]?.trim();
          if (val && isImageUrl(val)) {
            imageUrlsToFetch.push(val);
          }
        });
      }
    });
  }

  if (imageUrlsToFetch.length > 0) {
    onStatus?.('Fetching images...');
    const uniqueUrls = Array.from(new Set(imageUrlsToFetch));
    await Promise.all(uniqueUrls.map(async (url) => {
      const result = await fetchImageAsBase64(url);
      imageCache.set(url, result);
    }));
  }

  onStatus?.('Building document...');

  const children: any[] = [
    new Paragraph({ text: (currentTest.title || "Assessment Module").toUpperCase(), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ text: `${String(currentTest.category || "General").toUpperCase()} | ${String(currentTest.difficulty || "Medium").toUpperCase()}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new DocxTable({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Duration", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
            new DocxTableCell({ children: [new Paragraph({ text: "Nodes", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
            new DocxTableCell({ children: [new Paragraph({ text: "Pass Score", alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "F8FAFC" } }),
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
      children.push(new Paragraph({ children: [new TextRun({ text: "[Visual asset included in online version]", italics: true, color: "cbd5e1", size: 16 })], spacing: { after: 200 } }));
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
            new DocxTableCell({ children: [new Paragraph({ text: "Key Node", bold: true })], shading: { fill: "F1F5F9" } }), 
            new DocxTableCell({ children: [new Paragraph({ text: "Allocation", bold: true })], shading: { fill: "F1F5F9" } })
          ] 
        })
      ];

      parseRegistryArray(q.order_group).forEach(p => {
        const [l, r] = String(p).split('|').map(s => s.trim());
        const rightValue = withAnswers ? r : "";
        
        let rightCellContent: any = [new Paragraph({ text: rightValue })];
        
        if (withAnswers && rightValue && isImageUrl(rightValue)) {
          const imgData = imageCache.get(rightValue);
          if (imgData) {
            rightCellContent = [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: Buffer.from(imgData.data, 'base64'),
                    transformation: { width: 80, height: 80 },
                    type: imgData.type.replace('image/', '') as any
                  })
                ]
              })
            ];
          } else {
            rightCellContent = [
              new Paragraph({
                children: [new TextRun({ text: `[Image: ${rightValue}]`, italics: true, color: "999999", size: 16 })]
              })
            ];
          }
        }

        tableRows.push(new DocxTableRow({ 
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: l })] }), 
            new DocxTableCell({ children: rightCellContent })
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
      children.push(new Paragraph({ text: "________________________________________________", spacing: { before: 200 } }));
      if (withAnswers) {
        children.push(new Paragraph({ 
          children: [new TextRun({ text: `Correct Answer: ${correctArr.join(", ")}`, bold: true, color: "059669" })], 
          spacing: { before: 100 } 
        }));
      }
    }
  });

  const doc = new Document({ 
    sections: [{ 
      children,
      footers: {
        default: new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `DNTRNG | Authorized Extraction | Page `, size: 16 }),
            new TextRun({ children: ["PAGE_NUMBER"], size: 16 })
          ]
        })
      }
    }] 
  });
  
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${withAnswers ? 'answerkey' : 'questions'}_${dateIso}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}
