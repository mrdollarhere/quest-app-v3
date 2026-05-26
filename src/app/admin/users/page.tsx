"use client";

import React, { useState, useEffect } from 'react';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AILoader } from '@/components/ui/ai-loader';
import { useAdminData } from '@/hooks/useAdminData';
import { useToastHelper } from '@/hooks/useToastHelper';
import { logActivity } from '@/lib/activity-log';

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

  const { data: users, loading, refresh } = useAdminData({
    url: '/api/proxy/admin/users',
    initialData: []
  });

  const { data: responses } = useAdminData({
    url: '/api/proxy/admin/responses',
    initialData: []
  });

  // TACTICAL DIAGNOSTIC NODE
  useEffect(() => {
    console.log('[Registry Audit] Admin User Terminal Data Update:', {
      timestamp: new Date().toISOString(),
      loadingState: loading,
      isUsersArray: Array.isArray(users),
      usersPayload: users,
      isResponsesArray: Array.isArray(responses),
      responsesCount: Array.isArray(responses) ? responses.length : 'N/A'
    });

    if (users && (users as any).error) {
      console.error('[Registry Audit] Critical error detected in users payload:', (users as any).error);
    }
  }, [users, responses, loading]);

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
      setTimeout(refresh, 1000);
    } catch (err) {
      showError("Action Failed");
    }
  };

  if (loading && (!users || users.length === 0)) {
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
        onRefresh={refresh}
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
