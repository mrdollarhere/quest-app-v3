"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  FileJson, 
  Table, 
  ChevronDown, 
  Loader2,
  FileCheck,
  HelpCircle,
  X,
  FileCode
} from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  BorderStyle, 
  WidthType 
} from "docx";
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';
import { cn } from '@/lib/utils';

export default function AdminTestDetailPage() {
  const { id } = useParams();
  const testId = id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  const currentTest = tests.find(t => String(t.id) === String(testId)) || {};

  const handleExportPDF = async (withAnswers: boolean) => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    setShowExportModal(false);
    toast({ title: "Generating PDF... / Đang tạo PDF..." });

    try {
      // 1. Create hidden element for high-fidelity rendering
      const element = document.createElement('div');
      element.id = 'pdf-render-node';
      element.style.width = '794px'; // Standard A4 width at 96 DPI
      element.style.padding = '60px';
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#0f172a';
      element.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.zIndex = '-1';

      // 2. Build Content HTML
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
            <div>Total Nodes: ${questions.length}</div>
            <div>Export Date: ${new Date().toLocaleDateString()}</div>
            <div style="margin-top: 10px; font-weight: 800; color: ${withAnswers ? '#059669' : '#3b82f6'};">
              Type: ${withAnswers ? "Answer Key / Đáp án" : "Questions Only / Chỉ câu hỏi"}
            </div>
          </div>
        </div>
        <div style="border-bottom: 1px solid #f1f5f9; margin-bottom: 60px;"></div>
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
          html += `
            <div style="margin-bottom: 20px;">
              <img src="${q.image_url}" style="max-width: 100%; max-height: 300px; border: 1px solid #e2e8f0;" />
            </div>
          `;
        }

        if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
          html += '<div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">';
          options.forEach((opt, idx) => {
            const label = String.fromCharCode(65 + idx);
            const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
            html += `
              <div style="display: flex; align-items: flex-start; gap: 12px; font-size: 15px; ${isCorrect ? 'color: #059669; font-weight: 700;' : 'color: #475569;'}">
                <span style="font-weight: 800; color: ${isCorrect ? '#059669' : '#cbd5e1'}; min-width: 24px;">${label}.</span>
                <span>${opt} ${isCorrect ? '✓' : ''}</span>
              </div>
            `;
          });
          html += '</div>';
        } else if (qType === 'matching') {
          html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">';
          html += '<tr style="background: #f8fafc;"><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 800;">Key Node</th><th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 800;">Allocation</th></tr>';
          const pairs = parseRegistryArray(q.order_group);
          pairs.forEach(p => {
            const [l, r] = String(p).split('|').map(s => s.trim());
            html += `<tr><td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: 600;">${l}</td><td style="border: 1px solid #e2e8f0; padding: 12px; color: ${withAnswers ? '#059669' : '#cbd5e1'}; font-weight: ${withAnswers ? '700' : '400'};">${withAnswers ? r : '____________________'}</td></tr>`;
          });
          html += '</table>';
        } else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
          const rows = parseRegistryArray(q.order_group);
          const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
          html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">';
          html += `<tr style="background: #f8fafc;"><th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-weight: 800;">Interaction</th>${cols.map(c => `<th style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-weight: 800;">${c}</th>`).join('')}</tr>`;
          rows.forEach((row, rIdx) => {
            html += `<tr><td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 600;">${row}</td>`;
            cols.forEach(col => {
              const isChecked = withAnswers && compareValues(col, correctArr[rIdx]);
              html += `<td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">${isChecked ? '<span style="color: #059669; font-weight: 900; font-size: 18px;">●</span>' : '<span style="color: #e2e8f0; font-size: 18px;">○</span>'}</td>`;
            });
            html += '</tr>';
          });
          html += '</table>';
        } else {
          html += '<div style="margin-bottom: 20px; padding: 20px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; color: #94a3b8; font-size: 14px;">Response: ________________________________________________</div>';
          if (withAnswers) {
            html += `<div style="color: #059669; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 8px;"><span style="background: #ecfdf5; padding: 4px 10px; border-radius: 6px;">✓ Correct Answer: ${correctArr.join(', ')}</span></div>`;
          }
        }

        html += '</div>';
      });

      html += `
        <div style="text-align: center; margin-top: 80px; padding-top: 40px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 9px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.8em; margin-bottom: 8px;">DNTRNG™ • INTELLIGENCE REGISTRY</p>
          <p style="font-size: 8px; font-weight: bold; color: #e2e8f0; text-transform: uppercase;">Registry Node: ${testId}</p>
        </div>
      `;

      element.innerHTML = html;
      document.body.appendChild(element);

      // Hydration Protocol: Wait for potential browser reflow and image caching
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Capture with html2canvas (Supports Unicode natively via browser rendering)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(element);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering produced zero-dimension buffer.');
      }

      // 4. Generate PDF via Visual-Split Protocol
      // Use JPEG for better compression of high-res buffers to avoid string truncation errors
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Page 1
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      
      // Multi-page distribution
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const typeLabel = withAnswers ? "answerkey" : "questions";
      const dateKey = new Date().toISOString().split('T')[0];
      pdf.save(`DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${typeLabel}_${dateKey}.pdf`);
      
      toast({ title: "PDF exported / Xuất PDF thành công" });
    } catch (error) {
      console.error("[PDF Extraction Error]", error);
      toast({ variant: "destructive", title: "Extraction Failed / Lỗi xuất PDF" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async (withAnswers: boolean) => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    setShowExportModal(false);

    try {
      const dateStr = new Date().toLocaleDateString();
      
      const children: any[] = [
        new Paragraph({
          text: currentTest.title || "Assessment Module",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: `${currentTest.category || "General"} | ${currentTest.difficulty || "Medium"}`,
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new DocxTable({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: "Duration", alignment: AlignmentType.CENTER, style: "bold" })] }),
                new DocxTableCell({ children: [new Paragraph({ text: "Nodes", alignment: AlignmentType.CENTER, style: "bold" })] }),
                new DocxTableCell({ children: [new Paragraph({ text: "Pass Score", alignment: AlignmentType.CENTER, style: "bold" })] }),
                new DocxTableCell({ children: [new Paragraph({ text: "Exported At", alignment: AlignmentType.CENTER, style: "bold" })] }),
              ]
            }),
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: currentTest.duration || "15m", alignment: AlignmentType.CENTER })] }),
                new DocxTableCell({ children: [new Paragraph({ text: String(questions.length), alignment: AlignmentType.CENTER })] }),
                new DocxTableCell({ children: [new Paragraph({ text: `${currentTest.passing_threshold || 70}%`, alignment: AlignmentType.CENTER })] }),
                new DocxTableCell({ children: [new Paragraph({ text: dateStr, alignment: AlignmentType.CENTER })] }),
              ]
            })
          ],
          spacing: { after: 600 }
        }),
        new Paragraph({ text: "", spacing: { after: 400 } })
      ];

      questions.forEach((q, i) => {
        const qType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
        const correctArr = parseRegistryArray(q.correct_answer);

        children.push(new Paragraph({
          text: `${i + 1}. ${q.question_text}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }));

        children.push(new Paragraph({
          children: [new TextRun({ text: `Module: ${q.question_type}`, italics: true, color: "94a3b8", size: 18 })],
          spacing: { after: 200 }
        }));

        if (q.image_url) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "[Image: see online version for visual asset]", italics: true, color: "cbd5e1", size: 16 })],
            spacing: { after: 200 }
          }));
        }

        if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
          const opts = parseRegistryArray(q.options || q.order_group);
          opts.forEach((opt, idx) => {
            const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
            children.push(new Paragraph({
              text: `${opt}${isCorrect ? " [CORRECT ✓]" : ""}`,
              bullet: { level: 0 },
              spacing: { before: 100 }
            }));
          });
        } 
        else if (qType === 'matching') {
          const pairs = parseRegistryArray(q.order_group);
          const tableRows = [
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: "Key Node", bold: true })] }),
                new DocxTableCell({ children: [new Paragraph({ text: "Allocation", bold: true })] })
              ]
            })
          ];
          pairs.forEach(p => {
            const [l, r] = String(p).split('|').map(s => s.trim());
            tableRows.push(new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: l })] }),
                new DocxTableCell({ children: [new Paragraph({ text: withAnswers ? r : "" })] })
              ]
            }));
          });
          children.push(new DocxTable({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
        }
        else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
          const rows = parseRegistryArray(q.order_group);
          const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
          const tableRows = [
            new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: "Interaction", bold: true })] }),
                ...cols.map(c => new DocxTableCell({ children: [new Paragraph({ text: c, bold: true, alignment: AlignmentType.CENTER })] }))
              ]
            })
          ];
          rows.forEach((row, rIdx) => {
            tableRows.push(new DocxTableRow({
              children: [
                new DocxTableCell({ children: [new Paragraph({ text: row })] }),
                ...cols.map(col => {
                  const isCorrect = withAnswers && compareValues(col, correctArr[rIdx]);
                  return new DocxTableCell({ children: [new Paragraph({ text: isCorrect ? "✓" : "", alignment: AlignmentType.CENTER })] });
                })
              ]
            }));
          });
          children.push(new DocxTable({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE }, spacing: { before: 200, after: 200 } }));
        }
        else {
          children.push(new Paragraph({ text: "________________________________________________", spacing: { before: 200 } }));
          if (withAnswers) {
            children.push(new Paragraph({ children: [new TextRun({ text: `Correct Answer: ${correctArr.join(", ")}`, bold: true, color: "059669" })], spacing: { before: 100 } }));
          }
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${withAnswers ? 'answerkey' : 'questions'}_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Word document exported / Xuất Word thành công" });
    } catch (error) {
      toast({ variant: "destructive", title: "Word Export Failed" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (!testId || questions.length === 0) return;
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const infoAOA = [["Field", "Value"], ["Title", currentTest.title || "N/A"], ["Category", currentTest.category || "General"], ["Difficulty", currentTest.difficulty || "Medium"], ["Duration", currentTest.duration || "15m"], ["Pass Score", `${currentTest.passing_threshold || 70}%`], ["Questions", questions.length], ["Exported At", new Date().toLocaleString()]];
      const wsInfo = XLSX.utils.aoa_to_sheet(infoAOA);
      wsInfo['!cols'] = [{ wch: 15 }, { wch: 40 }];
      const questionsData = questions.map((q, i) => ({ "No.": i + 1, "Question": q.question_text, "Type": q.question_type, "Options": q.options || "[]", "Correct Answer": q.correct_answer || "[]", "Image URL": q.image_url || "", "Required": q.required ? "yes" : "no" }));
      const wsQuestions = XLSX.utils.json_to_sheet(questionsData);
      wsQuestions['!cols'] = [{ wch: 5 }, { wch: 50 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 10 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsInfo, "Test Info");
      XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${dateStr}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Excel exported / Xuất Excel thành công" });
    } catch (error) { toast({ variant: "destructive", title: "Excel Export Failed" }); }
    finally { setIsExporting(false); }
  };

  const handleExportJSON = () => {
    if (!testId || questions.length === 0) return;
    setIsExporting(true);
    try {
      const typeDistribution: Record<string, number> = {};
      questions.forEach(q => { const type = q.question_type || 'unknown'; typeDistribution[type] = (typeDistribution[type] || 0) + 1; });
      const exportData = { exportedAt: new Date().toISOString(), exportVersion: "1.0", platform: "DNTRNG", test: { id: currentTest.id, title: currentTest.title, description: currentTest.description, category: currentTest.category, difficulty: currentTest.difficulty, duration: currentTest.duration, passing_threshold: currentTest.passing_threshold, certificate_enabled: currentTest.certificate_enabled }, questions: questions.map(q => ({ id: q.id, question_text: q.question_text, question_type: q.question_type, options: q.options, correct_answer: q.correct_answer, order_group: q.order_group, image_url: q.image_url, metadata: q.metadata, required: q.required })), summary: { totalQuestions: questions.length, questionTypes: typeDistribution } };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url; link.download = `DNTRNG_${testId}_${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "JSON exported / Xuất JSON thành công" });
    } catch (error) { toast({ variant: "destructive", title: "Export Failed" }); }
    finally { setIsExporting(false); }
  };

  const fetchData = async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        fetch(`/api/proxy/admin/questions?id=${testId}`),
        fetch('/api/proxy/tests')
      ]);
      const qData = await qRes.json();
      const tData = await tRes.json();
      setQuestions(Array.isArray(qData) ? qData : []);
      setTests(Array.isArray(tData) ? tData : []);
    } catch (err) { toast({ variant: "destructive", title: "Sync Error" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [testId]);

  const openExportModal = (format: 'pdf' | 'docx') => {
    setExportFormat(format);
    setShowExportModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.push('/admin/tests')} disabled={loading} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Button>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading || isExporting} className="rounded-full h-11 px-6 font-bold border-2 bg-white shadow-sm">
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl border-none w-64 bg-white">
              <DropdownMenuItem onClick={() => openExportModal('pdf')} className="rounded-xl p-3 font-bold cursor-pointer">
                <FileText className="mr-3 h-4 w-4 text-rose-500" />
                <span>📄 Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openExportModal('docx')} className="rounded-xl p-3 font-bold cursor-pointer">
                <FileText className="mr-3 h-4 w-4 text-blue-500" />
                <span>📝 Export as Word (.docx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} className="rounded-xl p-3 font-bold cursor-pointer">
                <Table className="mr-3 h-4 w-4 text-emerald-500" />
                <span>📊 Export as Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="rounded-xl p-3 font-bold cursor-pointer">
                <FileCode className="mr-3 h-4 w-4 text-amber-500" />
                <span>🔧 Export as JSON (backup)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading && questions.length === 0 ? (
        <div className="py-20"><AILoader /></div>
      ) : (
        <QuestionsTab 
          questions={questions} tests={tests} selectedTestId={testId} 
          setSelectedTestId={(newId) => router.push(`/admin/tests/${newId}`)}
          onEdit={(q) => { setEditingItem(q); setDialogs({ ...dialogs, question: true }); }}
          onDelete={async (qid) => {
            const updated = questions.filter(q => q.id !== qid);
            setLoading(true);
            try {
              await fetch('/api/proxy/admin/save-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, questions: updated })
              });
              fetchData();
            } catch (err) { toast({ variant: "destructive", title: "Error" }); }
            finally { setLoading(false); }
          }}
          onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, question: true }); }}
          onBulkEdit={() => setDialogs({ ...dialogs, bulk: true })}
          loading={loading}
        />
      )}

      <AdminDialogs 
        dialogs={dialogs} setDialogs={setDialogs} editingItem={editingItem}
        selectedTestId={testId} questions={questions}
        onSaveTest={() => {}} onSaveUser={() => {}}
        onSaveQuestion={async (qData, isRequired) => {
          const prepared = { ...qData, required: isRequired ? "TRUE" : "FALSE" };
          setLoading(true);
          try {
            await fetch('/api/proxy/admin/save-question', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ testId, question: prepared })
            });
            setDialogs(prev => ({ ...prev, question: false }));
            fetchData();
          } catch (err) { toast({ variant: "destructive", title: "Error" }); }
          finally { setLoading(false); }
        }}
        onSaveBulk={async (json) => {
          try {
            const parsed = JSON.parse(json);
            setLoading(true);
            await fetch('/api/proxy/admin/save-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ testId, questions: parsed })
            });
            setDialogs(prev => ({ ...prev, bulk: false }));
            fetchData();
          } catch (e) { toast({ variant: "destructive", title: "Invalid JSON" }); }
          finally { setLoading(false); }
        }}
        loading={loading}
      />

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className={cn("p-3 rounded-2xl", exportFormat === 'pdf' ? "bg-rose-50" : "bg-blue-50")}>
                <FileText className={cn("w-6 h-6", exportFormat === 'pdf' ? "text-rose-500" : "text-blue-500")} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Export {exportFormat?.toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Select document variant
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-8 space-y-4">
             <Button 
                onClick={() => exportFormat === 'pdf' ? handleExportPDF(false) : handleExportWord(false)}
                className="w-full h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-primary/20 hover:bg-white transition-all text-slate-900 font-black flex items-center justify-between px-8 group shadow-sm hover:shadow-xl"
             >
                <div className="flex flex-col items-start">
                   <span className="text-lg uppercase tracking-tight">Questions Only</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chỉ câu hỏi • Student Edition</span>
                </div>
                <HelpCircle className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors" />
             </Button>

             <Button 
                onClick={() => exportFormat === 'pdf' ? handleExportPDF(true) : handleExportWord(true)}
                className="w-full h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-emerald-500/20 hover:bg-white transition-all text-slate-900 font-black flex items-center justify-between px-8 group shadow-sm hover:shadow-xl"
             >
                <div className="flex flex-col items-start">
                   <span className="text-lg uppercase tracking-tight">With Answer Key</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kèm đáp án • Teacher Edition</span>
                </div>
                <FileCheck className="w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
             </Button>
          </div>

          <DialogFooter>
             <Button variant="ghost" onClick={() => setShowExportModal(false)} className="w-full h-12 rounded-full font-bold text-slate-400">Cancel / Hủy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
