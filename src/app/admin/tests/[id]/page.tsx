
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

  // EXPORT REGISTRY HANDLERS
  const handleExportPDF = () => {
    console.log('[Export Protocol] Initializing PDF generation...');
  };

  const handleExportWord = () => {
    console.log('[Export Protocol] Initializing Word (.docx) generation...');
  };

  const handleExportExcel = () => {
    if (!testId || questions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const currentTest = tests.find(t => String(t.id) === String(testId)) || {};
      
      // 1. Prepare Metadata Sheet
      const metadataRows = [
        { "Registry Field": "Module ID", "Data Value": currentTest.id },
        { "Registry Field": "Title", "Data Value": currentTest.title },
        { "Registry Field": "Category", "Data Value": currentTest.category },
        { "Registry Field": "Difficulty", "Data Value": currentTest.difficulty },
        { "Registry Field": "Duration", "Data Value": currentTest.duration },
        { "Registry Field": "Passing Threshold (%)", "Data Value": currentTest.passing_threshold },
        { "Registry Field": "Certification Enabled", "Data Value": currentTest.certificate_enabled }
      ];

      // 2. Prepare Questions Sheet
      const questionsRows = questions.map(q => ({
        "ID": q.id,
        "Question Text": q.question_text,
        "Question Type": q.question_type,
        "Options": q.options,
        "Correct Answer": q.correct_answer,
        "Order Group": q.order_group,
        "Image URL": q.image_url,
        "Metadata": q.metadata,
        "Required": q.required ? "TRUE" : "FALSE"
      }));

      // 3. Construct Workbook
      const wb = XLSX.utils.book_new();
      const wsMetadata = XLSX.utils.json_to_sheet(metadataRows);
      const wsQuestions = XLSX.utils.json_to_sheet(questionsRows);

      XLSX.utils.book_append_sheet(wb, wsMetadata, "Test Info");
      XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions Registry");

      // 4. Trigger Autonomous Download using standard Blob pattern
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `DNTRNG_${testId}_${dateStr}.xlsx`;
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
      
      // Build Question Type Summary
      const typeDistribution: Record<string, number> = {};
      questions.forEach(q => {
        const type = q.question_type || 'unknown';
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      });

      // Construct High-Fidelity Export Object
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

      // Trigger Registry Download
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
      // SECURE ADMIN FETCH: Proxy route preserves correct_answer for editing
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
                <span>📄 Export as PDF (Soon)</span>
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
