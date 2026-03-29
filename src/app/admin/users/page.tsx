"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });
  const { toast } = useToast();

  const fetchData = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch(`${API_URL}?action=getUsers`),
        fetch(`${API_URL}?action=getResponses`)
      ]);
      const uData = await uRes.json();
      const rData = await rRes.json();
      setUsers(Array.isArray(uData) ? uData : []);
      setResponses(Array.isArray(rData) ? rData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch user registry." });
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
      toast({ title: "Success", description: "Identity record updated." });
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
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
          onDelete={(email) => handlePost('deleteUser', { email })}
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
        onSaveUser={(userData) => handlePost('saveUser', { data: userData })}
        onSaveUsers={(usersData) => handlePost('saveUsers', { data: usersData })}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
      />
    </div>
  );
}
