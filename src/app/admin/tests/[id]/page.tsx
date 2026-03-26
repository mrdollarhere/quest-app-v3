"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { Question } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminTestDetailPage() {
  const { id } = useParams();
  const testId = id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  const fetchData = async () => {
    if (!API_URL || !testId) return;
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        fetch(`${API_URL}?action=getQuestions&id=${testId}`),
        fetch(`${API_URL}?action=getTests`)
      ]);
      const qData = await qRes.json();
      const tData = await tRes.json();
      setQuestions(Array.isArray(qData) ? qData : []);
      setTests(Array.isArray(tData) ? tData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [testId]);

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return;
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      toast({ title: "Success", description: "Question set updated." });
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" onClick={() => router.push('/admin/tests')} className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Button>
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
          onDelete={(qid) => {
            const updated = questions.filter(q => q.id !== qid);
            handlePost('saveQuestions', { testId, questions: updated });
          }}
          onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, question: true }); }}
          onBulkEdit={() => setDialogs({ ...dialogs, bulk: true })}
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
        onSaveQuestion={(qData, isRequired) => {
          const newId = (qData.id as string)?.trim() || `q_${Date.now().toString().slice(-6)}`;
          const prepared = { ...qData, id: newId, required: isRequired ? "TRUE" : "FALSE" };
          const updated = editingItem ? questions.map(q => q.id === editingItem.id ? prepared : q) : [...questions, prepared];
          handlePost('saveQuestions', { testId, questions: updated });
        }}
        onSaveBulk={(json) => {
          try {
            const parsed = JSON.parse(json);
            handlePost('saveQuestions', { testId, questions: parsed });
            setDialogs({ ...dialogs, bulk: false });
          } catch (e) {
            toast({ variant: "destructive", title: "Invalid JSON" });
          }
        }}
      />
    </div>
  );
}
