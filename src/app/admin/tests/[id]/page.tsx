/**
 * AdminTestDetailPage.tsx
 * 
 * Purpose: Diagnostic detail terminal for assessment modules.
 * Refactored: v19.6.0 - Integrated AI Question Generator node.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AdvancedExportModal } from '@/components/admin/tests/AdvancedExportModal';
import { AIQuestionGenerator } from '@/components/admin/ai/AIQuestionGenerator';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, Sparkles, Plus } from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';
import { useSettings } from '@/context/settings-context';
import { generateTestPDF } from '@/lib/export/pdf-service';
import { generateTestWord } from '@/lib/export/word-service';
import { generateTestJSON } from '@/lib/export/data-service';
import { filterQuestions, selectQuestions, generateVersion, generateAllVersions } from '@/lib/export-utils';
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
  const [showAIModal, setShowAIModal] = useState(false);
  
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

  const handleBeginExport = async (config: any) => {
    setIsExporting(true);
    setShowExportModal(false);
    setExportStatus("Initializing...");
    
    toast({ title: "Generating export... / Đang tạo file...", description: "Assembling document nodes." });

    try {
      const filtered = filterQuestions(questions, config.difficulties);
      const selectedPool = selectQuestions(filtered, config.questionCount);

      if (config.versions > 1) {
        const zip = new JSZip();
        const allVersions = generateAllVersions(selectedPool, config.versions, config.shuffleQuestions, config.shuffleOptions);
        
        for (const v of allVersions) {
          setExportStatus(`Generating ${v.label}...`);
          if (config.format === 'pdf') {
            const blob = await generateTestPDF({ testId: String(testId), currentTest, questions: v.questions, withAnswers: config.contentType === 'answers', returnOutput: true, watermark: config.watermark }) as Blob;
            zip.file(`DNTRNG_${testId}_${v.label.replace(' ', '_')}.pdf`, blob);
          } else if (config.format === 'word') {
            const blob = await generateTestWord({ testId: String(testId), currentTest, questions: v.questions, withAnswers: config.contentType === 'answers', returnOutput: true, watermark: config.watermark }) as Blob;
            zip.file(`DNTRNG_${testId}_${v.label.replace(' ', '_')}.docx`, blob);
          }
        }

        const readmeContent = `DNTRNG Export Package\n-----------------------\nAssessment: ${currentTest.title || testId}\nVersions: ${config.versions}\nItems: ${selectedPool.length}`;
        zip.file("README.txt", readmeContent);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DNTRNG_${String(currentTest.title || testId).replace(/\s+/g, '_')}_ZIP.zip`;
        link.click();
      } else {
        const version = generateVersion(selectedPool, "A", config.shuffleQuestions, config.shuffleOptions);
        if (config.format === 'pdf') {
          await generateTestPDF({ testId: String(testId), currentTest, questions: version.questions, withAnswers: config.contentType === 'answers', watermark: config.watermark });
        } else if (config.format === 'word') {
          await generateTestWord({ testId: String(testId), currentTest, questions: version.questions, withAnswers: config.contentType === 'answers', watermark: config.watermark });
        } else if (config.format === 'json') {
          await generateTestJSON({ testId: String(testId), currentTest, questions: selectedPool });
        }
      }
      toast({ title: "Extraction Successful" });
    } catch (e) {
      toast({ variant: "destructive", title: "Export Failed" });
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

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAIModal(true)}
            className="rounded-full h-12 px-6 font-black uppercase text-[10px] tracking-widest bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/20 border-none transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" /> AI Generate
          </Button>

          <Button 
            onClick={() => setShowExportModal(true)} 
            disabled={loading || isExporting || questions.length === 0}
            className={cn(
              "rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all border-none",
              isExporting ? "bg-slate-100 text-slate-400" : "bg-primary text-white hover:scale-105 shadow-primary/20"
            )}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export / Xuất
          </Button>
        </div>
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
        open={showExportModal} onOpenChange={setShowExportModal} questions={questions} testTitle={String(currentTest.title || "Module")} 
        platformName={String(settings.platform_name || "DNTRNG")} onExport={handleBeginExport}
      />

      <AIQuestionGenerator 
        open={showAIModal} onOpenChange={setShowAIModal} testId={String(testId)} onComplete={fetchData} 
      />
    </div>
  );
}
