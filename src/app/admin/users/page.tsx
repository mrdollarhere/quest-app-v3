
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { UsersTab } from '@/components/admin/UsersTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogs, setDialogs] = useState({ test: false, user: false, question: false, bulk: false });
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getUsers`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch users." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      toast({ title: "Success", description: "User records updated." });
      setTimeout(fetchUsers, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UsersTab 
        users={users}
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
