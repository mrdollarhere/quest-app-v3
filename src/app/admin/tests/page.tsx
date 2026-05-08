
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TestsTab } from '@/components/admin/TestsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { QuestionAnalyticsDialog } from '@/components/admin/analytics/QuestionAnalyticsDialog';
import { useRouter } from 'next/navigation';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';

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
    setLoading(true);
    try {
      const [testsRes, responsesRes] = await Promise.all([
        fetch('/api/proxy/tests'),
        fetch('/api/proxy/admin/responses')
      ]);
      
      const [testsData, responsesData] = await Promise.all([
        testsRes.json(),
        responsesRes.json()
      ]);

      setTests(Array.isArray(testsData) ? testsData : []);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch tests via proxy." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handlePost = async (action: string, payload: any) => {
    const endpoint = action === 'deleteTest' ? '/api/proxy/admin/delete-test' : '/api/proxy/admin/save-test';
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error();
      
      toast({ title: "Success", description: "Test registry updated." });
      setDialogs({ ...dialogs, test: false });
      setTimeout(fetchTests, 1500);
      return true;
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const openAnalytics = async (test: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/questions?id=${test.id}`);
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
        onDelete={async (id) => {
          const t = tests.find(t => t.id === id);
          const ok = await handlePost('deleteTest', { id });
          if (ok) {
            logActivity("Test deleted", t?.title || id);
            trackEvent('admin_test_delete', { 
              test_id: id, 
              test_name: t?.title,
              details: { 
                testId: id,
                testName: t?.title,
                deletedAt: new Date().toISOString(),
                question_count: t?.questions_count || 0 
              }
            });
          }
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
        onSaveTest={async (testData) => {
          const payload = { ...testData };
          if (!payload.id) {
            const slug = (payload.title as string || 'test').toLowerCase().replace(/[^a-z0-9]/g, '-');
            payload.id = `${slug}-${Date.now().toString().slice(-4)}`;
          } else if (editingItem && payload.id !== editingItem.id) {
            payload.id = editingItem.id;
          }
          
          const ok = await handlePost('saveTest', { data: payload });
          if (ok) {
            logActivity(editingItem ? "Test edited" : "Test created", payload.title);
            
            if (editingItem) {
              const changedFields = [];
              if (editingItem.title !== payload.title) changedFields.push('title');
              if (editingItem.difficulty !== payload.difficulty) changedFields.push('difficulty');
              if (editingItem.duration !== payload.duration) changedFields.push('duration');
              if (editingItem.category !== payload.category) changedFields.push('category');
              if (editingItem.certificate_enabled !== payload.certificate_enabled) changedFields.push('certificate');
              if (editingItem.passing_threshold !== payload.passing_threshold) changedFields.push('threshold');

              trackEvent('admin_test_edit', { 
                test_id: payload.id, 
                test_name: payload.title,
                details: {
                  changed_fields: changedFields,
                  old_title: editingItem.title,
                  new_title: payload.title,
                  old_difficulty: editingItem.difficulty,
                  new_difficulty: payload.difficulty
                }
              });
            } else {
              trackEvent('admin_test_create', { 
                test_id: payload.id, 
                test_name: payload.title,
                details: {
                  difficulty: payload.difficulty,
                  duration: payload.duration,
                  category: payload.category,
                  certificate_enabled: payload.certificate_enabled
                }
              });
            }
          }
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
