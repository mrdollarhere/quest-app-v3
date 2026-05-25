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
import autoTable from 'jspdf-autotable';
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
    
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();
    const dateKey = new Date().toISOString().split('T')[0];

    // 1. Cover Page Construction
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(26, 35, 64);
    doc.text("DNTRNG", 105, 60, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(59, 91, 219);
    doc.text("INTELLIGENCE REGISTRY PROTOCOL", 105, 68, { align: "center" });

    doc.setDrawColor(59, 91, 219);
    doc.setLineWidth(1);
    doc.line(80, 75, 130, 75);

    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(currentTest.title || "Assessment Module", 160);
    doc.text(titleLines, 105, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text([
      `Category: ${currentTest.category || "General"}`,
      `Difficulty: ${currentTest.difficulty || "Medium"}`,
      `Duration: ${currentTest.duration || "15m"}`,
      `Total Nodes: ${questions.length}`,
      `Export Date: ${dateStr}`,
      `Type: ${withAnswers ? "Answer Key / Đáp án" : "Questions Only / Chỉ câu hỏi"}`
    ], 105, 130, { align: "center", lineHeightFactor: 1.5 });

    doc.setFontSize(8);
    doc.text(`Registry ID: ${testId}`, 105, 280, { align: "center" });

    // 2. Questions Generation Protocol
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      doc.addPage();
      
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`DNTRNG | ${currentTest.title}`, 14, 10);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 10, { align: "right" });

      let y = 30;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      const qText = `${i + 1}. ${q.question_text}`;
      const qLines = doc.splitTextToSize(qText, 180);
      doc.text(qLines, 14, y);
      y += (qLines.length * 7);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Module: ${String(q.question_type || '').replace(/_/g, ' ')}`, 14, y);
      y += 10;

      if (q.image_url) {
        y += 10;
        doc.setFontSize(8);
        doc.text("[Visual Asset Attached - View in online registry]", 14, y);
        y += 5;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      
      const qType = String(q.question_type || '').toLowerCase().replace(/[\s_]/g, '');
      const correctArr = parseRegistryArray(q.correct_answer);

      if (['singlechoice', 'oneanswer', 'multiplechoice', 'manyanswers', 'dropdown', 'ordering'].includes(qType)) {
        const opts = parseRegistryArray(q.options || q.order_group);
        opts.forEach((opt, idx) => {
          const label = String.fromCharCode(65 + idx);
          const isCorrect = withAnswers && correctArr.some(c => compareValues(c, opt));
          const optText = `${label}. ${opt}${isCorrect ? " ✓" : ""}`;
          const optLines = doc.splitTextToSize(optText, 170);
          if (isCorrect) doc.setTextColor(5, 150, 105);
          doc.text(optLines, 20, y);
          doc.setTextColor(51, 65, 85);
          y += (optLines.length * 6) + 2;
        });
      } 
      else if (qType === 'matching') {
        const pairs = parseRegistryArray(q.order_group);
        const body = pairs.map(p => {
          const [l, r] = String(p).split('|').map(s => s.trim());
          return [l, withAnswers ? r : "________________"];
        });
        autoTable(doc, {
          startY: y,
          head: [['Registry Key', 'Allocation']],
          body: body,
          theme: 'striped',
          headStyles: { fillColor: [59, 91, 219] },
          margin: { left: 14 }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      else if (qType === 'matrixchoice' || qType === 'multipletruefalse') {
        const rows = parseRegistryArray(q.order_group);
        const cols = qType === 'multipletruefalse' ? ['True', 'False'] : parseRegistryArray(q.options);
        const body = rows.map((row, rIdx) => {
          return [row, ...cols.map(col => {
            if (withAnswers && compareValues(col, correctArr[rIdx])) return "[ ✓ ]";
            return "[   ]";
          })];
        });
        autoTable(doc, {
          startY: y,
          head: [['Node', ...cols]],
          body: body,
          theme: 'grid',
          headStyles: { fillColor: [59, 91, 219] },
          margin: { left: 14 }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      else if (qType === 'shorttext' || qType === 'rating') {
        doc.text("Response: ________________________________________________", 14, y);
        y += 10;
        if (withAnswers) {
          doc.setTextColor(5, 150, 105);
          doc.text(`Correct: ${correctArr.join(", ")}`, 14, y);
          doc.setTextColor(51, 65, 85);
          y += 10;
        }
      }
    }

    const typeLabel = withAnswers ? "answerkey" : "questions";
    doc.save(`DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${typeLabel}_${dateKey}.pdf`);
    setIsExporting(false);
    toast({ title: "PDF exported / Xuất PDF thành công" });
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
