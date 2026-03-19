
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { API_URL } from '@/lib/api-config';
import { Question } from '@/types/quiz';
import { cn } from "@/lib/utils";

// Refactored Components
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { TestsTab } from '@/components/admin/TestsTab';
import { QuestionsTab } from '@/components/admin/QuestionsTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { ResponsesTab } from '@/components/admin/ResponsesTab';
import { AdminDialogs } from '@/components/admin/AdminDialogs';

export type AdminTab = 'overview' | 'tests' | 'questions' | 'users' | 'responses';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ tests: any[], users: any[], responses: any[] }>({
    tests: [],
    users: [],
    responses: []
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const { toast } = useToast();

  // Dialog States
  const [dialogs, setDialogs] = useState({
    test: false,
    user: false,
    question: false,
    bulk: false
  });
  const [editingItem, setEditingItem] = useState<any>(null);

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

      const validTests = Array.isArray(testsData) ? testsData : [];
      setData({
        tests: validTests,
        users: Array.isArray(usersData) ? usersData : [],
        responses: Array.isArray(responsesData) ? responsesData : []
      });

      if (validTests.length > 0 && !selectedTestId) {
        setSelectedTestId(validTests[0].id);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch data." });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId: string) => {
    if (!API_URL || !testId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getQuestions&id=${testId}`);
      const qData = await res.json();
      setQuestions(Array.isArray(qData) ? qData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load questions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'questions' && selectedTestId) {
      fetchQuestions(selectedTestId);
    }
  }, [activeTab, selectedTestId]);

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return;
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      toast({ title: "Operation Successful", description: "Changes queued for Google Sheets." });
      setTimeout(fetchData, 1500); 
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-black">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Only administrators can access this control panel.</p>
        <Link href="/" className="mt-6"><Button className="rounded-full">Return Home</Button></Link>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/30 w-full">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          logout={logout} 
        />

        <main className="flex-1">
          <header className="h-20 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h2 className="text-xl font-black capitalize tracking-tight text-slate-900">{activeTab}</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Cloud Sync Connected
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchData} disabled={loading} variant="outline" className="rounded-full border-2 font-bold px-6 bg-white hover:bg-slate-50">
                <Loader2 className={cn("w-4 h-4 mr-2", !loading && "hidden", loading && "animate-spin")} /> 
                Sync
              </Button>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {activeTab === 'overview' && (
              <OverviewTab 
                data={data} 
                onNewTest={() => { setEditingItem(null); setDialogs({ ...dialogs, test: true }); }}
                onManageContent={() => setActiveTab('questions')}
                onSync={fetchData}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'tests' && (
              <TestsTab 
                tests={data.tests} 
                onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, test: true }); }}
                onDelete={(id) => handlePost('deleteTest', { id })}
                onManageQuestions={(id) => { setSelectedTestId(id); setActiveTab('questions'); }}
                onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, test: true }); }}
              />
            )}
            {activeTab === 'questions' && (
              <QuestionsTab 
                questions={questions}
                tests={data.tests}
                selectedTestId={selectedTestId}
                setSelectedTestId={setSelectedTestId}
                onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, question: true }); }}
                onDelete={(id) => {
                  const updated = questions.filter(q => q.id !== id);
                  handlePost('saveQuestions', { testId: selectedTestId, questions: updated });
                }}
                onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, question: true }); }}
                onBulkEdit={() => setDialogs({ ...dialogs, bulk: true })}
              />
            )}
            {activeTab === 'users' && (
              <UsersTab 
                users={data.users}
                onEdit={(item) => { setEditingItem(item); setDialogs({ ...dialogs, user: true }); }}
                onDelete={(email) => handlePost('deleteUser', { email })}
                onAdd={() => { setEditingItem(null); setDialogs({ ...dialogs, user: true }); }}
              />
            )}
            {activeTab === 'responses' && (
              <ResponsesTab responses={data.responses} />
            )}
          </div>
        </main>
      </div>

      <AdminDialogs 
        dialogs={dialogs} 
        setDialogs={setDialogs}
        editingItem={editingItem}
        selectedTestId={selectedTestId}
        questions={questions}
        onSaveTest={(data) => handlePost('saveTest', { data })}
        onSaveUser={(data) => handlePost('saveUser', { data })}
        onSaveQuestion={(qData, isRequired) => {
          const newQuestionId = (qData.id as string)?.trim() || `q_${Date.now()}`;
          const prepared = { ...qData, id: newQuestionId, required: isRequired ? "TRUE" : "FALSE" };
          let updated = editingItem ? questions.map(q => q.id === editingItem.id ? prepared : q) : [...questions, prepared];
          handlePost('saveQuestions', { testId: selectedTestId, questions: updated });
        }}
        onSaveBulk={(json) => {
          try {
            const parsed = JSON.parse(json);
            handlePost('saveQuestions', { testId: selectedTestId, questions: parsed });
            setDialogs({ ...dialogs, bulk: false });
          } catch (e) {
            toast({ variant: "destructive", title: "Invalid JSON" });
          }
        }}
      />
    </SidebarProvider>
  );
}
