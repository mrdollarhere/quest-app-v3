/**
 * AdminTestDetailPage.tsx
 * 
 * Purpose: Diagnostic detail terminal for assessment modules.
 * Refactored: v19.2.1 - Extracted export services and modularized UI.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { ExportVersionDialog } from '@/components/admin/tests/ExportVersionDialog';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Table, ChevronDown, Loader2, FileCode } from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateTestPDF } from '@/lib/export/pdf-service';
import { generateTestWord } from '@/lib/export/word-service';
import { generateTestExcel, generateTestJSON } from '@/lib/export/data-service';

export default function AdminTestDetailPage() {
  const { id: testId } = useParams();
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

  const handleExport = async (withAnswers: boolean) => {
    setIsExporting(true); setShowExportModal(false);
    try {
      const params = { testId: String(testId), currentTest, questions, withAnswers };
      if (exportFormat === 'pdf') {
        toast({ title: "Generating PDF... / Đang tạo PDF..." });
        await generateTestPDF(params);
      } else if (exportFormat === 'docx') {
        await generateTestWord(params);
      }
      toast({ title: "Extraction Successful" });
    } catch (e) { toast({ variant: "destructive", title: "Export Failed" }); }
    finally { setIsExporting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.push('/admin/tests')} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={loading || isExporting} className="rounded-full h-11 px-6 font-bold border-2 bg-white shadow-sm">
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl border-none w-64 bg-white">
            <DropdownMenuItem onClick={() => { setExportFormat('pdf'); setShowExportModal(true); }} className="rounded-xl p-3 font-bold cursor-pointer"><FileText className="mr-3 h-4 w-4 text-rose-500" /> Export PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setExportFormat('docx'); setShowExportModal(true); }} className="rounded-xl p-3 font-bold cursor-pointer"><FileText className="mr-3 h-4 w-4 text-blue-500" /> Export Word</DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateTestExcel({ testId: String(testId), currentTest, questions })} className="rounded-xl p-3 font-bold cursor-pointer"><Table className="mr-3 h-4 w-4 text-emerald-500" /> Export Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateTestJSON({ testId: String(testId), currentTest, questions })} className="rounded-xl p-3 font-bold cursor-pointer"><FileCode className="mr-3 h-4 w-4 text-amber-500" /> Export JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      <ExportVersionDialog open={showExportModal} onOpenChange={setShowExportModal} format={exportFormat} onSelect={handleBeginExport => handleExport(handleBeginExport)} />
    </div>
  );
}
