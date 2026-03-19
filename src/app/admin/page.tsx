
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
  LogOut,
  ChevronRight,
  ClipboardList,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle2,
  HelpCircle
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { cn } from "@/lib/utils";
import { Question, QuestionType } from '@/types/quiz';

type AdminTab = 'overview' | 'tests' | 'questions' | 'users' | 'responses';

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
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // CRUD States
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isBulkJsonOpen, setIsBulkJsonOpen] = useState(false);
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

      const validTests = Array.isArray(testsData) ? testsData : [];
      setData({
        tests: validTests,
        users: Array.isArray(usersData) ? usersData : [],
        responses: Array.isArray(responsesData) ? responsesData : []
      });

      if (validTests.length > 0 && !selectedTestId) {
        setSelectedTestId(validTests[0].id);
      }

      toast({ title: "Sync Successful", description: "Dashboard data updated." });
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
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
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

  const saveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const qData = Object.fromEntries(formData.entries());
    
    let updatedQuestions = [...questions];
    if (editingItem) {
      updatedQuestions = updatedQuestions.map(q => q.id === editingItem.id ? { ...q, ...qData } : q);
    } else {
      updatedQuestions.push({ ...qData } as any);
    }
    
    handlePost('saveQuestions', { testId: selectedTestId, questions: updatedQuestions });
    setIsQuestionDialogOpen(false);
  };

  const deleteQuestion = (qId: string) => {
    if (confirm("Delete this question?")) {
      const updatedQuestions = questions.filter(q => q.id !== qId);
      handlePost('saveQuestions', { testId: selectedTestId, questions: updatedQuestions });
    }
  };

  const openBulkEditor = () => {
    setQuestionJson(JSON.stringify(questions, null, 2));
    setIsBulkJsonOpen(true);
  };

  const saveBulkQuestions = () => {
    try {
      const parsed = JSON.parse(questionJson);
      handlePost('saveQuestions', { testId: selectedTestId, questions: parsed });
      setIsBulkJsonOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Invalid JSON", description: "Please check your format." });
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
        <div><CardTitle>Assessments</CardTitle><CardDescription>Manage test registry</CardDescription></div>
        <div className="flex gap-4">
          <Input placeholder="Filter tests..." className="w-64 rounded-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={() => { setEditingItem(null); setIsTestDialogOpen(true); }} className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add Test</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.tests.filter(t => (t.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((t, i) => (
              <TableRow key={i}>
                <TableCell><Badge variant="outline">{t.id}</Badge></TableCell>
                <TableCell className="font-bold">{t.title}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTestId(t.id); setActiveTab('questions'); }} className="rounded-full text-blue-600"><FileText className="w-4 h-4 mr-1" /> Questions</Button>
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

  const renderQuestions = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><HelpCircle className="w-6 h-6" /></div>
            <div>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>Manage content for individual assessments</CardDescription>
            </div>
          </div>
          <div className="flex gap-3">
             <Select value={selectedTestId} onValueChange={setSelectedTestId}>
              <SelectTrigger className="w-[200px] rounded-full">
                <SelectValue placeholder="Select a test" />
              </SelectTrigger>
              <SelectContent>
                {data.tests.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title || t.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={openBulkEditor} className="rounded-full"><FileText className="w-4 h-4 mr-2" /> Bulk JSON</Button>
            <Button onClick={() => { setEditingItem(null); setIsQuestionDialogOpen(true); }} className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Question Text</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {questions.map((q, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-mono">{q.id}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{q.question_type.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="max-w-md truncate font-medium">{q.question_text}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingItem(q); setIsQuestionDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)} className="rounded-full text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No questions found for this test.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
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
                    { id: 'questions', label: 'Questions', icon: HelpCircle },
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
            {activeTab === 'questions' && renderQuestions()}
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

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Question' : 'Add Question'}</DialogTitle></DialogHeader>
          <form onSubmit={saveQuestion} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Question ID</Label><Input name="id" defaultValue={editingItem?.id} required /></div>
              <div className="space-y-2"><Label>Type</Label>
                <select name="question_type" defaultValue={editingItem?.question_type || 'single_choice'} className="w-full h-10 px-3 rounded-md border bg-background text-sm">
                  <option value="single_choice">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_text">Short Text</option>
                  <option value="ordering">Ordering</option>
                  <option value="matching">Matching</option>
                  <option value="hotspot">Hotspot</option>
                  <option value="rating">Rating</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Question Text</Label><Textarea name="question_text" defaultValue={editingItem?.question_text} required /></div>
            <div className="space-y-2"><Label>Options (Comma separated)</Label><Input name="options" defaultValue={editingItem?.options} placeholder="Option A, Option B, Option C" /></div>
            <div className="space-y-2"><Label>Correct Answer</Label><Input name="correct_answer" defaultValue={editingItem?.correct_answer} /></div>
            <div className="space-y-2"><Label>Order Group / Matching Pairs</Label><Input name="order_group" defaultValue={editingItem?.order_group} placeholder="Item1,Item2 OR Prompt|Answer" /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} /></div>
            <div className="space-y-2"><Label>Metadata (Hotspot JSON)</Label><Textarea name="metadata" defaultValue={editingItem?.metadata} placeholder='[{"id":"z1","label":"Zone","x":50,"y":50,"radius":10}]' /></div>
            <div className="flex items-center space-x-2 py-2">
               <input type="checkbox" name="required" id="q_required" defaultChecked={editingItem?.required === "TRUE" || editingItem?.required === true} />
               <Label htmlFor="q_required">Required Question</Label>
            </div>
            <DialogFooter><Button type="submit" className="rounded-full w-full">Save Question</Button></DialogFooter>
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
              <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-10 px-3 rounded-md border bg-background text-sm">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter><Button type="submit" className="rounded-full w-full">Save User Account</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk JSON Editor */}
      <Dialog open={isBulkJsonOpen} onOpenChange={setIsBulkJsonOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col rounded-[2rem]">
          <DialogHeader><DialogTitle>Bulk Question Editor: {selectedTestId}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-hidden py-4">
            <Textarea className="h-full font-mono text-xs p-4 bg-slate-900 text-green-400 rounded-xl" value={questionJson} onChange={(e) => setQuestionJson(e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBulkJsonOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={saveBulkQuestions} className="rounded-full"><Save className="w-4 h-4 mr-2" /> Save Bulk Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
