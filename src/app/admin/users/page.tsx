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
    console.log('[Registry Audit] Admin User Terminal State Update:', {
      timestamp: new Date().toISOString(),
      status: {
        users: usersLoading ? 'LOADING' : usersError ? 'ERROR' : 'READY',
        responses: responsesLoading ? 'LOADING' : responsesError ? 'ERROR' : 'READY'
      },
      payload: {
        usersCount: Array.isArray(users) ? users.length : 'NOT_AN_ARRAY',
        responsesCount: Array.isArray(responses) ? responses.length : 'NOT_AN_ARRAY'
      },
      diagnostics: {
        usersError: usersError?.message || null,
        responsesError: responsesError?.message || null,
        rawUsers: users
      }
    });

    if (usersError || responsesError) {
      console.error('[Registry Audit] Critical Handshake Failure detected in Admin Terminal.');
    }
  }, [users, responses, usersLoading, responsesLoading, usersError, responsesError]);

  const handleRefreshAll = () => {
    console.log('[Registry Audit] Initializing Manual Force Sync...');
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
