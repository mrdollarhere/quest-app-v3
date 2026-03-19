
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ tests: any[], users: any[], responses: any[] }>({
    tests: [],
    users: [],
    responses: []
  });
  const { toast } = useToast();
  const router = useRouter();

  const [dialogs, setDialogs] = useState({
    test: false,
    user: false,
    question: false,
    bulk: false
  });

  const fetchData = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const [testsRes, usersRes, responsesRes] = await Promise.all([
        fetch(`${API_URL}?action=getTests`),
        fetch(`${API_URL}?action=getUsers`),
        fetch(`${API_URL}?action=getResponses`)
      ]);

      const [testsData, usersData, responsesData] = await Promise.all([
        testsRes.json(),
        usersRes.json(),
        responsesRes.json()
      ]);

      setData({
        tests: Array.isArray(testsData) ? testsData : [],
        users: Array.isArray(usersData) ? usersData : [],
        responses: Array.isArray(responsesData) ? responsesData : []
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      toast({ title: "Success", description: "Changes saved to cloud." });
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <OverviewTab 
        data={data} 
        onNewTest={() => setDialogs({ ...dialogs, test: true })}
        onManageContent={() => router.push('/admin/tests')}
        onSync={fetchData}
        setActiveTab={(tab) => router.push(`/admin/${tab === 'overview' ? '' : tab}`)}
      />

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={null}
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
        onSaveUser={(userData) => handlePost('saveUser', { data: userData })}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
      />
    </div>
  );
}
