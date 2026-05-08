"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AILoader } from '@/components/ui/ai-loader';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Registry Protocol: Protected Proxy Fetch
      const [uRes, rRes] = await Promise.all([
        fetch('/api/proxy/admin/users'),
        fetch('/api/proxy/admin/responses')
      ]);
      
      if (!uRes.ok || !rRes.ok) throw new Error('Registry denied access');
      
      const uData = await uRes.json();
      const rData = await rRes.json();
      
      setUsers(Array.isArray(uData) ? uData : []);
      setResponses(Array.isArray(rData) ? rData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Security Error", description: "Could not access student registry." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePost = async (url: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error();
      
      toast({ title: "Success", description: "Registry updated." });
      setDialogs({ ...dialogs, user: false });
      setTimeout(fetchData, 1500);
      return true;
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && users.length === 0 ? (
        <div className="py-20">
          <AILoader />
        </div>
      ) : (
        <UsersTab 
          users={users}
          responses={responses}
          loading={loading}
          onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, user: true }); }}
          onDelete={async (email) => {
            const ok = await handlePost('/api/proxy/admin/delete-user', { email });
            if (ok) logActivity("Student deleted", email);
          }}
          onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, user: true }); }}
          onRefresh={fetchData}
        />
      )}

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId=""
        questions={[]}
        onSaveTest={() => {}}
        onSaveUser={async (userData) => {
          await handlePost('/api/proxy/admin/save-user', { data: userData });
        }}
        onSaveUsers={async (usersData) => {
          await handlePost('/api/proxy/admin/save-users', { data: usersData });
        }}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
        loading={loading}
      />
    </div>
  );
}
