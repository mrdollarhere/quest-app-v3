/**
 * AdminTestDetailPage.tsx
 * 
 * Purpose: Diagnostic detail terminal for assessment modules.
 * Refactored: v19.3.0 - Implemented Advanced Export Modal with versioning and random selection.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AdvancedExportModal } from '@/components/admin/tests/AdvancedExportModal';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, Sparkles } from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';
import { useSettings } from '@/context/settings-context';
import { generateTestPDF } from '@/lib/export/pdf-service';
import { generateTestWord } from '@/lib/export/word-service';
import { generateTestJSON } from '@/lib/export/data-service';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

export default function AdminTestDetailPage() {
  const { id: testId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  const currentTest = tests.find(t => String(t.id) === String(testId)) || {};

  const fetchData = useCallback(async () => {
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
  }, [testId, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * ADVANCED EXPORT HANDLER
   * Orchestrates the document assembly based on the provided configuration.
   */
  const handleBeginExport = async (config: any) => {
    setIsExporting(true);
    setShowExportModal(false);
    setExportStatus("Generating export...");
    
    toast({ 
      title: "Generating export... / Đang tạo file...", 
      description: "Assembling document nodes. This may take a moment."
    });

    try {
      // Temporary: Log config until export services are updated to handle the new object
      console.log('[Registry Export] Initializing with config:', config);
      
      // Mapped Logic for existing formats (Single Version only for now)
      if (config.format === 'pdf') {
        await generateTestPDF({ 
          testId: String(testId), 
          currentTest, 
          questions: questions.slice(0, config.questionCount === 'all' ? questions.length : config.questionCount), 
          withAnswers: config.contentType === 'answers',
          onStatus: (s) => setExportStatus(s)
        });
      } else if (config.format === 'word') {
        await generateTestWord({ 
          testId: String(testId), 
          currentTest, 
          questions: questions.slice(0, config.questionCount === 'all' ? questions.length : config.questionCount), 
          withAnswers: config.contentType === 'answers',
          onStatus: (s) => setExportStatus(s)
        });
      } else if (config.format === 'json') {
        await generateTestJSON({ 
          testId: String(testId), 
          currentTest, 
          questions 
        });
      }
      
      toast({ title: "Extraction Successful / Xuất thành công" });
    } catch (e) {
      console.error('[Export Error]', e);
      toast({ variant: "destructive", title: "Export Failed / Xuất thất bại" });
    } finally {
      setIsExporting(false);
      setExportStatus("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.push('/admin/tests')} className="rounded-full font-bold text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Button>

        <Button 
          onClick={() => setShowExportModal(true)} 
          disabled={loading || isExporting || questions.length === 0}
          className={cn(
            "rounded-full h-12 px-10 font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all border-none",
            isExporting ? "bg-slate-100 text-slate-400" : "bg-primary text-white hover:scale-105 shadow-primary/20"
          )}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
              {exportStatus || 'Working...'}
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-3" />
              Export / Xuất
            </>
          )}
        </Button>
      </div>

      {loading && questions.length === 0 ? <div className="py-20"><AILoader /></div> : (
        <QuestionsTab 
          questions={questions} tests={tests} selectedTestId={String(testId)} 
          setSelectedTestId={(newId) => router.push(`/admin/tests/${newId}`)}
          onEdit={(q) => { setEditingItem(q); setDialogs({ ...dialogs, question: true }); }}
          onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, question: true }); }}
          onBulkEdit={() => setDialogs({ ...dialogs, bulk: true })}
          onDelete={async (qid) => {
            setLoading(true);
            try {
              await fetch('/api/proxy/admin/save-questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId, questions: questions.filter(q => q.id !== qid) }) });
              fetchData();
            } catch (err) { toast({ variant: "destructive", title: "Error" }); } finally { setLoading(false); }
          }}
          loading={loading}
        />
      )}

      <AdminDialogs 
        dialogs={dialogs} setDialogs={setDialogs} editingItem={editingItem} selectedTestId={String(testId)} questions={questions}
        onSaveQuestion={async (qData, isRequired) => {
          setLoading(true);
          try {
            await fetch('/api/proxy/admin/save-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId, question: { ...qData, required: isRequired ? "TRUE" : "FALSE" } }) });
            setDialogs(prev => ({ ...prev, question: false })); fetchData();
          } catch (err) { toast({ variant: "destructive", title: "Error" }); } finally { setLoading(false); }
        }}
        onSaveBulk={async (json) => {
          try {
            const parsed = JSON.parse(json); setLoading(true);
            await fetch('/api/proxy/admin/save-questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId, questions: parsed }) });
            setDialogs(prev => ({ ...prev, bulk: false })); fetchData();
          } catch (e) { toast({ variant: "destructive", title: "Invalid JSON" }); } finally { setLoading(false); }
        }}
        onSaveTest={() => {}} onSaveUser={() => {}} loading={loading}
      />

      <AdvancedExportModal 
        open={showExportModal}
        onOpenChange={setShowExportModal}
        questions={questions}
        testTitle={String(currentTest.title || "Module")}
        platformName={String(settings.platform_name || "DNTRNG")}
        onExport={handleBeginExport}
      />
    </div>
  );
}
