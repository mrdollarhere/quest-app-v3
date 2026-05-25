
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
  Loader2 
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
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminTestDetailPage() {
  const { id } = useParams();
  const testId = id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  const handleExportPDF = () => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const currentTest = tests.find(t => String(t.id) === String(testId)) || {};
      const dateStr = new Date().toLocaleDateString();

      // 1. Header Protocol
      doc.setFontSize(22);
      doc.setTextColor(26, 35, 64); // Navy
      doc.text(currentTest.title || "DNTRNG Assessment", 14, 20);

      // 2. Metadata Section
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Gray
      doc.text(`Category: ${currentTest.category || "General"} | Difficulty: ${currentTest.difficulty || "Medium"} | Duration: ${currentTest.duration || "15m"}`, 14, 28);
      doc.text(`Exported: ${dateStr} | Questions: ${questions.length} | Threshold: ${currentTest.passing_threshold || 70}%`, 14, 33);

      // 3. Questions Registry Table
      const tableData = questions.map((q, i) => {
        let optionsText = 'N/A';
        try {
          const opts = q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [];
          optionsText = Array.isArray(opts) ? opts.join(', ') : String(opts);
        } catch (e) {}

        let correctText = 'N/A';
        try {
          const ans = q.correct_answer ? (typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer) : [];
          correctText = Array.isArray(ans) ? ans.join(', ') : String(ans);
        } catch (e) {}

        return [
          i + 1,
          q.question_text,
          String(q.question_type || '').replace(/_/g, ' '),
          optionsText,
          correctText
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [['No.', 'Question Prompt', 'Type', 'Options', 'Correct Answer']],
        body: tableData,
        headStyles: { fillColor: [59, 91, 219], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // 4. Trigger Autonomous Download
      const dateKey = new Date().toISOString().split('T')[0];
      const filename = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${dateKey}.pdf`;
      doc.save(filename);

      toast({ title: "PDF exported / Xuất PDF thành công" });
      trackEvent('admin_test_export_pdf', { test_id: testId, test_name: currentTest.title });
    } catch (error) {
      console.error('[Export Error]', error);
      toast({ variant: "destructive", title: "PDF Export Failed / Xuất PDF thất bại" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = () => {
    // Word Protocol: Targeted for future implementation
    console.log('[Export Protocol] Initializing Word (.docx) generation...');
    toast({ title: "Word Export coming soon!" });
  };

  const handleExportExcel = () => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const currentTest = tests.find(t => String(t.id) === String(testId)) || {};
      const dateStr = new Date().toISOString().split('T')[0];

      // 1. Construct SHEET 1 — "Test Info"
      const infoAOA = [
        ["Field", "Value"],
        ["Title", currentTest.title || "N/A"],
        ["Category", currentTest.category || "General"],
        ["Difficulty", currentTest.difficulty || "Medium"],
        ["Duration", currentTest.duration || "15m"],
        ["Pass Score", `${currentTest.passing_threshold || 70}%`],
        ["Questions", questions.length],
        ["Exported At", new Date().toLocaleString()]
      ];
      const wsInfo = XLSX.utils.aoa_to_sheet(infoAOA);

      // Apply Column Widths for Info
      wsInfo['!cols'] = [{ wch: 15 }, { wch: 40 }];

      // 2. Construct SHEET 2 — "Questions"
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

      // Apply Column Widths for Questions Registry
      wsQuestions['!cols'] = [
        { wch: 5 },  // No.
        { wch: 50 }, // Question
        { wch: 15 }, // Type
        { wch: 30 }, // Options
        { wch: 30 }, // Correct Answer
        { wch: 30 }, // Image URL
        { wch: 10 }  // Required
      ];

      // 3. Create Workbook Registry
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsInfo, "Test Info");
      XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");

      // 4. Trigger Autonomous Download
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `DNTRNG_${(currentTest.title || testId).replace(/\s+/g, '_')}_${dateStr}.xlsx`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Excel exported / Xuất Excel thành công" });
      trackEvent('admin_test_export_excel', { test_id: testId, test_name: currentTest.title });
    } catch (error) {
      toast({ variant: "destructive", title: "Excel Export Failed / Xuất Excel thất bại" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const currentTest = tests.find(t => String(t.id) === String(testId)) || {};
      
      const typeDistribution: Record<string, number> = {};
      questions.forEach(q => {
        const type = q.question_type || 'unknown';
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      });

      const exportData = {
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0",
        platform: "DNTRNG",
        test: {
          id: currentTest.id,
          title: currentTest.title,
          description: currentTest.description,
          category: currentTest.category,
          difficulty: currentTest.difficulty,
          duration: currentTest.duration,
          passing_threshold: currentTest.passing_threshold,
          certificate_enabled: currentTest.certificate_enabled
        },
        questions: questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          order_group: q.order_group,
          image_url: q.image_url,
          metadata: q.metadata,
          required: q.required
        })),
        summary: {
          totalQuestions: questions.length,
          questionTypes: typeDistribution
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `DNTRNG_${testId}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "JSON exported / Xuất JSON thành công" });
      trackEvent('admin_test_export_json', { test_id: testId, test_name: currentTest.title });
    } catch (error) {
      toast({ variant: "destructive", title: "Export Failed / Xuất thất bại" });
    } finally {
      setIsExporting(false);
    }
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

      const testExists = Array.isArray(tData) && tData.some(t => String(t.id) === String(testId));
      if (!testExists && !loading) {
        toast({
          variant: "destructive",
          title: "Test Not Found",
          description: "The requested module does not exist in the registry.",
        });
        router.replace('/admin/tests');
        return;
      }

      setQuestions(Array.isArray(qData) ? qData : []);
      setTests(Array.isArray(tData) ? tData : []);
      
      const currentTest = tData.find((t: any) => String(t.id) === String(testId));
      trackEvent('admin_test_view', { test_id: testId, test_name: currentTest?.title });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load module data." });
      router.replace('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [testId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.push('/admin/tests')} disabled={loading} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Button>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                disabled={loading || isExporting} 
                className="rounded-full h-11 px-6 font-bold border-2 bg-white shadow-sm hover:bg-slate-50 transition-all"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl border-none w-64 bg-white">
              <DropdownMenuItem 
                onClick={handleExportPDF} 
                disabled={isExporting} 
                className="rounded-xl p-3 font-bold cursor-pointer"
              >
                <FileText className="mr-3 h-4 w-4 text-rose-500" />
                <span>📄 Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportWord} 
                disabled={isExporting} 
                className="rounded-xl p-3 font-bold cursor-pointer"
              >
                <FileText className="mr-3 h-4 w-4 text-blue-500" />
                <span>📝 Export as Word (Soon)</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportExcel} 
                disabled={isExporting} 
                className="rounded-xl p-3 font-bold cursor-pointer"
              >
                <Table className="mr-3 h-4 w-4 text-emerald-500" />
                <span>📊 Export as Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportJSON} 
                disabled={isExporting} 
                className="rounded-xl p-3 font-bold cursor-pointer"
              >
                <FileJson className="mr-3 h-4 w-4 text-amber-500" />
                <span>🔧 Export as JSON (backup)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading && questions.length === 0 ? (
        <div className="py-20">
          <AILoader />
        </div>
      ) : (
        <QuestionsTab 
          questions={questions}
          tests={tests}
          selectedTestId={testId}
          setSelectedTestId={(newId) => router.push(`/admin/tests/${newId}`)}
          onEdit={(q) => { setEditingItem(q); setDialogs({ ...dialogs, question: true }); }}
          onDelete={async (qid) => {
            const q = questions.find(q => q.id === qid);
            const updated = questions.filter(q => q.id !== qid);
            setLoading(true);
            try {
              await fetch('/api/proxy/admin/save-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, questions: updated })
              });
              logActivity("Question deleted", q?.question_text || qid);
              trackEvent('admin_question_delete', { 
                test_id: testId, 
                test_name: tests.find(t => t.id === testId)?.title,
                question_id: qid
              });
              fetchData();
            } catch (err) {
              toast({ variant: "destructive", title: "Error" });
            } finally {
              setLoading(false);
            }
          }}
          onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, question: true }); }}
          onBulkEdit={() => setDialogs({ ...dialogs, bulk: true })}
          loading={loading}
        />
      )}

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId={testId}
        questions={questions}
        onSaveTest={() => {}}
        onSaveUser={() => {}}
        onSaveQuestion={async (qData, isRequired) => {
          const newId = (qData.id as string)?.trim() || `q_${Date.now().toString().slice(-6)}`;
          const prepared = { ...qData, id: newId, required: isRequired ? "TRUE" : "FALSE" };
          setLoading(true);
          try {
            await fetch('/api/proxy/admin/save-question', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ testId, question: prepared })
            });
            logActivity(editingItem ? "Question edited" : "Question added", qData.question_text);
            const testTitle = tests.find(t => t.id === testId)?.title;
            trackEvent(editingItem ? 'admin_question_edit' : 'admin_question_create', { 
              test_id: testId, test_name: testTitle, question_id: newId
            });
            setDialogs(prev => ({ ...prev, question: false }));
            fetchData();
          } catch (err) {
            toast({ variant: "destructive", title: "Error" });
          } finally {
            setLoading(false);
          }
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
            logActivity("Bulk intelligence push", `${parsed.length} questions committed to ${testId}`);
            trackEvent('admin_question_bulk_import', { test_id: testId });
            setDialogs(prev => ({ ...prev, bulk: false }));
            fetchData();
          } catch (e) {
            toast({ variant: "destructive", title: "Invalid JSON" });
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
      />
    </div>
  );
}
