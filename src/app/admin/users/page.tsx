
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { Loader2 } from 'lucide-react';

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

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-bold text-muted-foreground">Syncing Identity Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersTab 
        users={users}
        responses={responses}
        onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, user: true }); }}
        onDelete={(email) => handlePost('deleteUser', { email })}
        onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, user: true }); }}
      />

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId=""
        questions={[]}
        onSaveTest={() => {}}
        onSaveUser={(userData) => handlePost('saveUser', { data: userData })}
        onSaveQuestion={() => {}}
        onSaveBulk={() => {}}
      />
    </div>
  );
}
