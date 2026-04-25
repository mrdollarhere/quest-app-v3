"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { ChangelogPanel } from '@/components/admin/ChangelogPanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { AVAILABLE_TESTS } from '@/app/lib/demo-data';
import { useSettings } from '@/context/settings-context';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveActivityWidget } from '@/components/admin/LiveActivityWidget';

const DashboardCharts = dynamic(() => 
  import('@/components/admin/DashboardCharts').then(mod => mod.DashboardCharts), 
  { 
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[450px]">
        <Skeleton className="lg:col-span-8 rounded-[2.5rem]" />
        <Skeleton className="lg:col-span-4 rounded-[2.5rem]" />
      </div>
    )
  }
);

function AdminDashboardContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings, refreshSettings } = useSettings();
  const lastTracked = useRef<string | null>(null);
  
  // Protocol: Define missing dialog state for administration terminal
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  useEffect(() => {
    const key = 'page_view_admin' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view', { details: 'Admin Dashboard Overview' });
  }, []);

  const { data, mutate, isLoading } = useSWR(
    API_URL ? 'admin-dashboard-data' : null,
    async () => {
      const [testsRes, usersRes, responsesRes] = await Promise.all([
        fetch(`${API_URL}?action=getTests`),
        fetch(`${API_URL}?action=getUsers`),
        fetch(`${API_URL}?action=getResponses`)
      ]);
      const [tests, users, responses] = await Promise.all([
        testsRes.json(),
        usersRes.json(),
        responsesRes.json()
      ]);
      return {
        tests: Array.isArray(tests) ? tests : [],
        users: Array.isArray(users) ? users : [],
        responses: Array.isArray(responses) ? responses : []
      };
    },
    { revalidateOnFocus: false }
  );

  const dashboardData = data || { tests: [], users: [], responses: [] };

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'route-not-found') {
      toast({ variant: "destructive", title: "Navigation Error", description: "The requested route was not found." });
      router.replace('/admin');
    }
  }, [searchParams, router, toast]);

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      mutate();
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    const ok = await handlePost('saveSetting', { key, value });
    if (ok) {
      toast({ title: "Success", description: "Settings updated." });
      logActivity("Settings updated", key);
      trackEvent('admin_settings_save', { details: key });
      refreshSettings();
    }
  };

  const handleSeedData = async () => {
    toast({ title: "Seeding Started", description: "Initializing demo library..." });
    try {
      for (const test of AVAILABLE_TESTS) {
        await handlePost('saveTest', { data: { ...test, image_url: test.image }});
      }
      toast({ title: "Sync Complete", description: "Demo library synchronized." });
      mutate();
    } catch (error) {
      toast({ variant: "destructive", title: "Seed Error" });
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <OverviewTab 
        data={dashboardData} 
        lastSync={new Date()}
        settings={settings}
        onNewTest={() => setDialogs({ ...dialogs, test: true })}
        onManageContent={() => router.push('/admin/tests')}
        onSync={() => mutate()}
        onSeed={handleSeedData}
        onSaveSetting={handleSaveSetting}
        setActiveTab={(tab) => router.push(`/admin/${tab === 'overview' ? '' : tab}`)}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <DashboardCharts responses={dashboardData.responses} onSeeAll={() => router.push('/admin/responses')} />
        </div>
        <div className="lg:col-span-4">
          <LiveActivityWidget />
        </div>
      </div>

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
            trackEvent('admin_test_create', { test_id: payload.id, test_name: payload.title });
            toast({ title: "Success", description: "Test record updated." });
            setDialogs(prev => ({ ...prev, test: false }));
          }
        }}
        onSaveUser={async (userData) => {
          const ok = await handlePost('saveUser', { data: userData });
          if (ok) {
            trackEvent('admin_student_add', { details: userData.email });
            toast({ title: "Success", description: "Student record updated." });
            setDialogs(prev => ({ ...prev, user: false }));
          }
        }}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
        loading={isLoading}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}
