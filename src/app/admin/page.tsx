"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { ChangelogPanel } from '@/components/admin/ChangelogPanel';
import { useRouter } from 'next/navigation';
import { DEMO_QUESTIONS, AVAILABLE_TESTS } from '@/app/lib/demo-data';
import { useSettings } from '@/context/settings-context';
import { logActivity } from '@/lib/activity-log';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [data, setData] = useState<{ tests: any[], users: any[], responses: any[] }>({
    tests: [],
    users: [],
    responses: []
  });
  const { toast } = useToast();
  const router = useRouter();
  const { settings, refreshSettings } = useSettings();

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
      setLastSync(new Date());
      refreshSettings();
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
      setDialogs({ ...dialogs, test: false, user: false });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    const ok = await handlePost('saveSetting', { key, value });
    if (ok) {
      toast({ title: "Success", description: "System settings updated." });
      logActivity("Settings updated", key);
    }
  };

  const handleSeedData = async () => {
    toast({ title: "Seeding Started", description: "Initializing demo library across all nodes..." });
    
    try {
      for (const test of AVAILABLE_TESTS) {
        await handlePost('saveTest', { data: {
          id: test.id,
          title: test.title,
          description: test.description,
          category: test.category,
          difficulty: test.difficulty,
          duration: test.duration,
          image_url: test.image
        }});
      }

      for (const test of AVAILABLE_TESTS) {
        await handlePost('saveQuestions', { 
          testId: test.id, 
          questions: DEMO_QUESTIONS 
        });
      }

      logActivity("Bulk seed performed", `${AVAILABLE_TESTS.length} modules initialized`);
      toast({ title: "Sync Complete", description: "All assessment modules are now live." });
      setTimeout(fetchData, 2000);
    } catch (error) {
      toast({ variant: "destructive", title: "Seed Error", description: "Could not complete the library sync." });
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <OverviewTab 
        data={data} 
        lastSync={lastSync}
        settings={settings}
        onNewTest={() => setDialogs({ ...dialogs, test: true })}
        onManageContent={() => router.push('/admin/tests')}
        onSync={fetchData}
        onSeed={handleSeedData}
        onSaveSetting={handleSaveSetting}
        setActiveTab={(tab) => router.push(`/admin/${tab === 'overview' ? '' : tab}`)}
        loading={loading}
      />

      <ChangelogPanel />

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={null}
        selectedTestId=""
        questions={[]}
        onSaveTest={async (testData) => {
          const payload = { ...testData };
          if (!payload.id) {
            const slug = (payload.title as string || 'test').toLowerCase().replace(/[^a-z0-9]/g, '-');
            payload.id = `${slug}-${Date.now().toString().slice(-4)}`;
          }
          const ok = await handlePost('saveTest', { data: payload });
          if (ok) {
            toast({ title: "Success", description: "Test record updated." });
            logActivity("Test created/edited", payload.title);
            fetchData();
          }
        }}
        onSaveUser={async (userData) => {
          const ok = await handlePost('saveUser', { data: userData });
          if (ok) {
            toast({ title: "Success", description: "Student record updated." });
            logActivity("Student provisioning", userData.name);
            fetchData();
          }
        }}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
        loading={loading}
      />
    </div>
  );
}
