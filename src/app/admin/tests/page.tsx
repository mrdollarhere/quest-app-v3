
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { TestsTab } from '@/components/admin/TestsTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { useRouter } from 'next/navigation';

export default function AdminTestsPage() {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });
  const { toast } = useToast();
  const router = useRouter();

  const fetchTests = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getTests`);
      const data = await res.json();
      setTests(Array.isArray(data) ? data : []);
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
      setTimeout(fetchTests, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TestsTab 
        tests={tests} 
        onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, test: true }); }}
        onDelete={(id) => handlePost('deleteTest', { id })}
        onManageQuestions={(id) => router.push(`/admin/tests/${id}`)}
        onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, test: true }); }}
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
        }}
        onSaveUser={() => {}}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
      />
    </div>
  );
}
