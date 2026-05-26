"use client";

import React, { useState, useEffect } from 'react';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AILoader } from '@/components/ui/ai-loader';
import { useAdminData } from '@/hooks/useAdminData';
import { useToastHelper } from '@/hooks/useToastHelper';
import { logActivity } from '@/lib/activity-log';
import { AlertCircle, ShieldAlert, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * DNTRNG™ USERS TERMINAL
 * 
 * Refactored: v19.4.0 (Phase 2 Hardening)
 * Purpose: Management interface for student nodes.
 */
export default function AdminUsersPage() {
  const { showSuccess, showError } = useToastHelper();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });

  const { data: users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useAdminData({
    url: '/api/proxy/admin/users',
    initialData: []
  });

  const { data: responses, loading: responsesLoading, error: responsesError, refresh: refreshResponses } = useAdminData({
    url: '/api/proxy/admin/responses',
    initialData: []
  });

  // TACTICAL DIAGNOSTIC NODE
  useEffect(() => {
    if (usersError || responsesError) {
      console.error('[Registry Audit] Critical Handshake Failure detected in Admin Terminal:', {
        usersError: usersError?.message,
        responsesError: responsesError?.message
      });
    }
  }, [usersError, responsesError]);

  const handleRefreshAll = () => {
    refreshUsers();
    refreshResponses();
  };

  const handleAction = async (url: string, payload: any, activityLabel: string) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error();
      
      showSuccess("Registry Updated");
      setDialogs(prev => ({ ...prev, user: false }));
      logActivity(activityLabel, payload.email || "Batch Operation");
      setTimeout(handleRefreshAll, 1000);
    } catch (err) {
      showError("Action Failed");
    }
  };

  const loading = usersLoading || (responsesLoading && (!responses || responses.length === 0));

  // ERROR TERMINAL RENDER
  if (usersError || responsesError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Handshake Failure</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            The registry bridge rejected the request. This usually indicates an outdated GAS script or API key mismatch.
          </p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs text-rose-600 max-w-lg w-full overflow-hidden">
          <p className="font-bold mb-2 uppercase tracking-widest text-[10px] text-slate-400">Error Registry Trace:</p>
          {usersError?.message || responsesError?.message || "Unknown Exception"}
        </div>
        <div className="flex gap-4">
          <Button onClick={handleRefreshAll} className="rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest bg-slate-900">
            <RefreshCcw className="w-4 h-4 mr-2" /> Retry Handshake
          </Button>
          <Button variant="outline" onClick={() => window.location.href='/setup-guide'} className="rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest border-2">
            View Setup Guide
          </Button>
        </div>
      </div>
    );
  }

  if (usersLoading && (!users || users.length === 0)) {
    return <div className="py-20"><AILoader messages={["Accessing Identity Registry..."]} /></div>;
  }

  return (
    <div className="space-y-6">
      <UsersTab 
        users={users}
        responses={responses}
        loading={loading}
        onEdit={(item: any) => { setEditingItem(item); setDialogs(prev => ({ ...prev, user: true })); }}
        onDelete={(email: string) => handleAction('/api/proxy/admin/delete-user', { email }, "Student deleted")}
        onAdd={() => { setEditingItem(null); setDialogs(prev => ({ ...prev, user: true })); }}
        onRefresh={handleRefreshAll}
      />

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId=""
        questions={[]}
        onSaveTest={() => {}}
        onSaveUser={(data: any) => handleAction('/api/proxy/admin/save-user', { data }, "Student record updated")}
        onSaveUsers={(data: any[]) => handleAction('/api/proxy/admin/save-users', { data }, "Batch provisioned")}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
        loading={loading}
      />
    </div>
  );
}
