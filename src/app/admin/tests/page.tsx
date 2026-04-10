"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { TestsTab } from '@/components/admin/TestsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { QuestionAnalyticsDialog } from '@/components/admin/analytics/QuestionAnalyticsDialog';
import { useRouter } from 'next/navigation';
import { logActivity } from '@/lib/activity-log';

export default function AdminTestsPage() {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [analyticsTest, setAnalyticsTest] = useState<any>(null);
  const [analyticsQuestions, setAnalyticsQuestions] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });
  const { toast } = useToast();
  const router = useRouter();

  const fetchTests = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const [testsRes, responsesRes] = await Promise.all([
        fetch(`${API_URL}?action=getTests`),
        fetch(`${API_URL}?action=getResponses`)
      ]);
      
      const [testsData, responsesData] = await Promise.all([
        testsRes.json(),
        responsesRes.json()
      ]);

      setTests(Array.isArray(testsData) ? testsData : []);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch tests." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return;
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      toast({ title: "Success", description: "Test list updated." });
      setDialogs({ ...dialogs, test: false });
      setTimeout(fetchTests, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  const openAnalytics = async (test: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getQuestions&id=${test.id}`);
      const questions = await res.json();
      setAnalyticsQuestions(Array.isArray(questions) ? questions : []);
      setAnalyticsTest(test);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch question registry." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TestsTab 
        tests={tests} 
        loading={loading}
        onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, test: true }); }}
        onDelete={(id) => {
          const t = tests.find(t => t.id === id);
          handlePost('deleteTest', { id });
          logActivity("Test deleted", t?.title || id);
        }}
        onManageQuestions={(id) => router.push(`/admin/tests/${id}`)}
        onViewAnalytics={openAnalytics}
        onAdd={() => router.push('/admin/tests/new')}
        onRefresh={fetchTests}
      />

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId=""
        questions={[]}
        onSaveTest={(testData) => {
          const payload = { ...testData };
          if (!payload.id) {
            const slug = (payload.title as string || 'test').toLowerCase().replace(/[^a-z0-9]/g, '-');
            payload.id = `${slug}-${Date.now().toString().slice(-4)}`;
          }
          handlePost('saveTest', { data: payload });
          logActivity(editingItem ? "Test edited" : "Test created", payload.title);
        }}
        onSaveUser={() => {}}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
        loading={loading}
      />

      <QuestionAnalyticsDialog 
        open={!!analyticsTest}
        onOpenChange={(open) => !open && setAnalyticsTest(null)}
        test={analyticsTest}
        questions={analyticsQuestions}
        responses={responses}
      />
    </div>
  );
}
