
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  LayoutGrid, 
  Settings, 
  RefreshCcw, 
  Users as UsersIcon,
  BarChart3,
  Search,
  ShieldAlert,
  Loader2,
  Table as TableIcon,
  FileText,
  MessageSquare,
  Home,
  LogOut,
  ChevronRight,
  ClipboardList,
  Plus,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { API_URL } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { cn } from "@/lib/utils";

type AdminTab = 'overview' | 'tests' | 'users' | 'responses';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ tests: any[], users: any[], responses: any[] }>({
    tests: [],
    users: [],
    responses: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // CRUD States
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [questionJson, setQuestionJson] = useState("");

  const fetchData = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const testsRes = await fetch(`${API_URL}?action=getTests`);
      const testsData = await testsRes.json();
      const usersRes = await fetch(`${API_URL}?action=getUsers`);
      const usersData = await usersRes.json();
      const responsesRes = await fetch(`${API_URL}?action=getResponses`);
      const responsesData = await responsesRes.json();

      setData({
        tests: Array.isArray(testsData) ? testsData : [],
        users: Array.isArray(usersData) ? usersData : [],
        responses: Array.isArray(responsesData) ? responsesData : []
      });

      toast({ title: "Sync Successful", description: "Dashboard data updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

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
      // Optimistic update for UI if needed, or just refetch
      setTimeout(fetchData, 1500); // Wait for GAS to process
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD HANDLERS ---
  const saveTest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const testData = Object.fromEntries(formData.entries());
    handlePost('saveTest', { data: testData });
    setIsTestDialogOpen(false);
  };

  const deleteTest = (id: string) => {
    if (confirm(`Delete test "${id}" and all its questions?`)) {
      handlePost('deleteTest', { id });
    }
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const userData = Object.fromEntries(formData.entries());
    handlePost('saveUser', { data: userData });
    setIsUserDialogOpen(false);
  };

  const deleteUser = (email: string) => {
    if (confirm(`Delete user "${email}"?`)) {
      handlePost('deleteUser', { email });
    }
  };

  const openQuestionEditor = async (testId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getQuestions&id=${testId}`);
      const questions = await res.json();
      setQuestionJson(JSON.stringify(questions, null, 2));
      setEditingItem(testId);
      setIsQuestionDialogOpen(true);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch questions." });
    } finally {
      setLoading(false);
    }
  };

  const saveQuestions = () => {
    try {
      const questions = JSON.parse(questionJson);
      handlePost('saveQuestions', { testId: editingItem, questions });
      setIsQuestionDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Invalid JSON", description: "Please check your question format." });
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

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm"><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><LayoutGrid className="w-6 h-6" /></div><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Tests</p><p className="text-3xl font-black">{data.tests.length}</p></div></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 bg-green-50 rounded-2xl text-green-600"><UsersIcon className="w-6 h-6" /></div><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Users</p><p className="text-3xl font-black">{data.users.length}</p></div></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><ClipboardList className="w-6 h-6" /></div><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Results</p><p className="text-3xl font-black">{data.responses.length}</p></div></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><Database className="w-6 h-6" /></div><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</p><p className="text-sm font-black text-orange-600">CONNECTED</p></div></CardContent></Card>
      </div>
    </div>
  );

  const renderTests = () => (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Assessments</CardTitle><CardDescription>Manage test registry and questions</CardDescription></div>
        <div className="flex gap-4">
          <Input placeholder="Filter tests..." className="w-64 rounded-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={() => { setEditingItem(null); setIsTestDialogOpen(true); }} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Test</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.tests.filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase())).map((t, i) => (
              <TableRow key={i}>
                <TableCell><Badge variant="outline">{t.id}</Badge></TableCell>
                <TableCell className="font-bold">{t.title}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openQuestionEditor(t.id)} className="rounded-full text-blue-600"><FileText className="w-4 h-4 mr-1" /> Questions</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingItem(t); setIsTestDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTest(t.id)} className="rounded-full text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUsers = () => (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Users</CardTitle><CardDescription>Manage platform access</CardDescription></div>
        <Button onClick={() => { setEditingItem(null); setIsUserDialogOpen(true); }} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add User</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.users.map((u, i) => (
              <TableRow key={i}>
                <TableCell className="font-bold">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge></TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingItem(u); setIsUserDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteUser(u.email)} className="rounded-full text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderResponses = () => (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader><CardTitle>Results</CardTitle><CardDescription>Recent test submissions</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Test</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.responses.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs">{new Date(r.Timestamp).toLocaleString()}</TableCell>
                <TableCell>{r['Test ID']}</TableCell>
                <TableCell className="font-bold">{r.Score} / {r.Total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/50 w-full">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3"><div className="bg-primary p-2 rounded-xl shadow-lg"><Settings className="text-white w-5 h-5" /></div><div><h1 className="text-lg font-black tracking-tight">Admin</h1><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">QuestFlow Panel</p></div></div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Core Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                    { id: 'tests', label: 'Assessments', icon: ClipboardList },
                    { id: 'users', label: 'User Table', icon: UsersIcon },
                    { id: 'responses', label: 'Results & Logs', icon: MessageSquare }
                  ].map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton isActive={activeTab === item.id} onClick={() => setActiveTab(item.id as AdminTab)} className={cn("h-12 px-4 rounded-xl font-bold transition-all", activeTab === item.id ? "bg-primary text-white shadow-md hover:bg-primary" : "text-slate-500 hover:bg-slate-100")}>
                        <item.icon className="w-5 h-5 mr-3" /> {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t bg-slate-50/50">
            <div className="p-4 bg-white rounded-2xl border flex items-center justify-between">
              <div className="flex flex-col"><span className="text-xs font-black">{user.displayName || 'Admin'}</span><span className="text-[10px] text-muted-foreground font-medium truncate w-24">{user.email}</span></div>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-destructive hover:bg-destructive/10"><LogOut className="w-4 h-4" /></Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          <header className="h-20 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4"><SidebarTrigger className="lg:hidden" /><div><h2 className="text-xl font-black capitalize tracking-tight">{activeTab} Control</h2><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Cloud Sync Active</span></div></div>
            <Button onClick={fetchData} disabled={loading} variant="outline" className="rounded-full border-2 font-bold px-6"><RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Sync</Button>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'tests' && renderTests()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'responses' && renderResponses()}
          </div>
        </main>
      </div>

      {/* --- CRUD DIALOGS --- */}

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Test' : 'Add New Test'}</DialogTitle></DialogHeader>
          <form onSubmit={saveTest} className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Test ID (Must be unique)</Label><Input name="id" defaultValue={editingItem?.id} required disabled={!!editingItem} /></div>
            <div className="space-y-2"><Label>Title</Label><Input name="title" defaultValue={editingItem?.title} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" defaultValue={editingItem?.description} /></div>
            <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={editingItem?.category} /></div>
            <div className="space-y-2"><Label>Difficulty</Label><Input name="difficulty" defaultValue={editingItem?.difficulty} /></div>
            <div className="space-y-2"><Label>Duration</Label><Input name="duration" defaultValue={editingItem?.duration} placeholder="e.g. 15 mins" /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} /></div>
            <DialogFooter><Button type="submit" className="rounded-full w-full">Save Assessment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
          <form onSubmit={saveUser} className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editingItem?.email} required disabled={!!editingItem} /></div>
            <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={editingItem?.name} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" placeholder="Leave empty if unchanged" required={!editingItem} /></div>
            <div className="space-y-2"><Label>Role</Label>
              <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-10 px-3 rounded-md border bg-background">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter><Button type="submit" className="rounded-full w-full">Save User Account</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question JSON Editor */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col rounded-[2rem]">
          <DialogHeader><DialogTitle>Edit Questions for: {editingItem}</DialogTitle><DialogDescription>Directly modify the question array in JSON format.</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-hidden py-4">
            <Textarea className="h-full font-mono text-xs p-4 bg-slate-900 text-green-400 rounded-xl" value={questionJson} onChange={(e) => setQuestionJson(e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={saveQuestions} className="rounded-full"><Save className="w-4 h-4 mr-2" /> Save Questions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
