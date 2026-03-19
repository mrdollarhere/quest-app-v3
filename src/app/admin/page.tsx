
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  HelpCircle,
  TrendingUp,
  Activity,
  History,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
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

  // Derived data for charts
  const chartData = useMemo(() => {
    if (!data.responses.length) return [];
    
    // Group responses by date
    const counts: Record<string, number> = {};
    data.responses.forEach(r => {
      const date = new Date(r.Timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .reverse()
      .slice(-7); // Last 7 days with activity
  }, [data.responses]);

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
    if (!selectedTestId) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select a test first." });
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const qData = Object.fromEntries(formData.entries());
    const isRequired = formData.get('required') === 'on';
    
    // Auto-generate ID if empty
    const newQuestionId = (qData.id as string)?.trim() || `q_${Date.now()}`;
    
    const preparedQuestion = {
      ...qData,
      id: newQuestionId,
      required: isRequired ? "TRUE" : "FALSE"
    };

    let updatedQuestions = [...questions];
    if (editingItem) {
      updatedQuestions = updatedQuestions.map(q => q.id === editingItem.id ? { ...preparedQuestion } : q);
    } else {
      updatedQuestions.push(preparedQuestion as any);
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
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assessments</p>
              <p className="text-3xl font-black">{data.tests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-2xl text-green-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Students</p>
              <p className="text-3xl font-black">{data.users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submissions</p>
              <p className="text-3xl font-black">{data.responses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. Score</p>
              <p className="text-3xl font-black">
                {data.responses.length > 0 
                  ? `${Math.round((data.responses.reduce((acc, r) => acc + (Number(r.Score) || 0), 0) / data.responses.reduce((acc, r) => acc + (Number(r.Total) || 1), 0)) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black">Submission Trends</CardTitle>
                <CardDescription>Activity overview for the current week</CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-bold">LIVE ACTIVITY</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 800, color: 'hsl(var(--primary))'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                <History className="w-12 h-12 opacity-20" />
                <p className="font-bold">No recent activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel: Recent Results */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-black">Recent Activity</CardTitle>
            <CardDescription>Latest test completions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {data.responses.slice(0, 6).map((resp, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs",
                    (Number(resp.Score) / Number(resp.Total)) >= 0.7 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {resp.Score}/{resp.Total}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{resp['Test ID']}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{new Date(resp.Timestamp).toLocaleString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
              {data.responses.length === 0 && (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No submissions recorded yet</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="ghost" className="w-full font-bold text-xs rounded-xl" onClick={() => setActiveTab('responses')}>
              View Full History
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-blue-600 text-white cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => { setEditingItem(null); setIsTestDialogOpen(true); }}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl"><Plus className="w-6 h-6" /></div>
            <div>
              <p className="font-black text-lg">Create Test</p>
              <p className="text-xs text-white/80 font-medium">Add a new assessment sheet</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-900 text-white cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setActiveTab('questions')}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl"><Zap className="w-6 h-6" /></div>
            <div>
              <p className="font-black text-lg">Manage Content</p>
              <p className="text-xs text-white/60 font-medium">Edit existing question banks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white cursor-pointer hover:scale-[1.02] transition-transform border-2 border-slate-100" onClick={fetchData}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-900"><RefreshCcw className="w-6 h-6" /></div>
            <div>
              <p className="font-black text-lg">Sync Cloud</p>
              <p className="text-xs text-muted-foreground font-medium">Fetch latest Google Sheet data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTests = () => (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="font-black text-2xl">Assessments</CardTitle><CardDescription>Manage your master test registry</CardDescription></div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Filter tests..." className="pl-10 rounded-full bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingItem(null); setIsTestDialogOpen(true); }} className="rounded-full gap-2 font-bold shadow-lg"><Plus className="w-4 h-4" /> New Test</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow className="bg-slate-50/50"><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.tests.filter(t => (t.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((t, i) => (
              <TableRow key={i} className="group">
                <TableCell><Badge variant="outline" className="font-mono">{t.id}</Badge></TableCell>
                <TableCell className="font-black text-slate-700">{t.title}</TableCell>
                <TableCell><Badge variant="secondary" className="font-bold">{t.category}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTestId(t.id); setActiveTab('questions'); }} className="rounded-full text-primary font-bold"><FileText className="w-4 h-4 mr-1" /> Questions</Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(t); setIsTestDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTest(t.id)} className="rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
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
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><HelpCircle className="w-6 h-6" /></div>
            <div>
              <CardTitle className="font-black text-2xl">Question Bank</CardTitle>
              <CardDescription>Content management for selected assessments</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Select value={selectedTestId} onValueChange={setSelectedTestId}>
              <SelectTrigger className="w-[220px] rounded-full font-bold border-2">
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {data.tests.map(t => (
                  <SelectItem key={t.id} value={t.id} className="font-bold">{t.title || t.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={openBulkEditor} className="rounded-full font-bold border-2"><FileText className="w-4 h-4 mr-2" /> Bulk Edit</Button>
            <Button onClick={() => { setEditingItem(null); setIsQuestionDialogOpen(true); }} className="rounded-full font-bold shadow-lg"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/50"><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Question Content</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {questions.map((q, i) => (
                <TableRow key={i} className="group">
                  <TableCell className="text-xs font-mono text-slate-400">{q.id}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize font-bold">{q.question_type?.replace('_', ' ') || 'Unknown'}</Badge></TableCell>
                  <TableCell className="max-w-md truncate font-bold text-slate-700">{q.question_text}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingItem(q); setIsQuestionDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)} className="rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground bg-slate-50/20">
                    <div className="flex flex-col items-center gap-2">
                      <HelpCircle className="w-10 h-10 opacity-20" />
                      <p className="font-bold">No questions found for this test.</p>
                      <Button variant="link" onClick={() => setIsQuestionDialogOpen(true)}>Create the first question</Button>
                    </div>
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
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
        <div><CardTitle className="font-black text-2xl">Users</CardTitle><CardDescription>Platform access and account control</CardDescription></div>
        <Button onClick={() => { setEditingItem(null); setIsUserDialogOpen(true); }} className="rounded-full gap-2 font-bold shadow-lg"><Plus className="w-4 h-4" /> New Account</Button>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow className="bg-slate-50/50"><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.users.map((u, i) => (
              <TableRow key={i} className="group">
                <TableCell className="font-black text-slate-700">{u.name}</TableCell>
                <TableCell className="font-medium text-slate-500">{u.email}</TableCell>
                <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="font-bold uppercase tracking-wider text-[10px]">{u.role}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(u); setIsUserDialogOpen(true); }} className="rounded-full"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteUser(u.email)} className="rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
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
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="font-black text-2xl">Global Results</CardTitle>
        <CardDescription>Comprehensive log of all test submissions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow className="bg-slate-50/50"><TableHead>Timestamp</TableHead><TableHead>Assessment</TableHead><TableHead>Score</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.responses.map((r, i) => {
              const score = Number(r.Score);
              const total = Number(r.Total);
              const pct = (score / total) * 100;
              return (
                <TableRow key={i}>
                  <TableCell className="text-xs font-medium text-slate-500">{new Date(r.Timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-black text-slate-700">{r['Test ID']}</TableCell>
                  <TableCell className="font-bold">{score} / {total}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-black px-3",
                      pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                    )}>
                      {pct >= 80 ? 'EXCELLENT' : pct >= 50 ? 'PASS' : 'FAIL'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/30 w-full">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-2xl shadow-xl">
                <Settings className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">QuestFlow</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">Console v11.0</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 pt-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Core Management</SidebarGroupLabel>
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
                      <SidebarMenuButton 
                        isActive={activeTab === item.id} 
                        onClick={() => setActiveTab(item.id as AdminTab)} 
                        className={cn(
                          "h-12 px-4 rounded-xl font-bold transition-all border-2 border-transparent mb-1", 
                          activeTab === item.id 
                            ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary" 
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" /> {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t bg-slate-50/50">
            <div className="p-4 bg-white rounded-[1.5rem] border shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-black">{user?.displayName || 'Admin'}</span>
                <span className="text-[10px] text-muted-foreground font-medium truncate w-24">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

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
                <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> 
                Sync
              </Button>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'tests' && renderTests()}
            {activeTab === 'questions' && renderQuestions()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'responses' && renderResponses()}
          </div>
        </main>
      </div>

      {/* --- CRUD DIALOGS --- */}

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogTitle className="text-2xl font-black">{editingItem ? 'Edit Test' : 'New Assessment'}</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">Define the core metadata for your quiz.</DialogDescription>
          </div>
          <form onSubmit={saveTest} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Test ID</Label><Input name="id" defaultValue={editingItem?.id} required disabled={!!editingItem} className="rounded-xl h-11" /></div>
              <div className="space-y-2"><Label className="font-bold">Category</Label><Input name="category" defaultValue={editingItem?.category} className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Title</Label><Input name="title" defaultValue={editingItem?.title} required className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Description</Label><Textarea name="description" defaultValue={editingItem?.description} className="rounded-xl min-h-[80px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Difficulty</Label><Input name="difficulty" defaultValue={editingItem?.difficulty} className="rounded-xl h-11" /></div>
              <div className="space-y-2"><Label className="font-bold">Duration</Label><Input name="duration" defaultValue={editingItem?.duration} placeholder="e.g. 15m" className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Image URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} className="rounded-xl h-11" /></div>
            <DialogFooter className="pt-4"><Button type="submit" className="rounded-full w-full h-12 font-black text-lg shadow-xl">Save Assessment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black">{editingItem ? 'Edit Question' : 'New Question'}</DialogTitle>
            <DialogDescription className="text-white/60">Configuring item for: <span className="text-white font-bold">{selectedTestId}</span></DialogDescription>
          </div>
          <form onSubmit={saveQuestion} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Type</Label>
                <select name="question_type" defaultValue={editingItem?.question_type || 'single_choice'} className="w-full h-11 px-3 rounded-xl border bg-slate-50 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20">
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
              <div className="space-y-2">
                <Label className="font-bold">Question ID</Label>
                <Input 
                  name="id" 
                  defaultValue={editingItem?.id} 
                  placeholder="Auto-generated if empty" 
                  className="rounded-xl h-11" 
                  disabled={!!editingItem}
                />
              </div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Prompt Text</Label><Textarea name="question_text" defaultValue={editingItem?.question_text} required className="rounded-xl min-h-[100px]" /></div>
            <div className="space-y-2"><Label className="font-bold">Choices (Comma separated)</Label><Input name="options" defaultValue={editingItem?.options} placeholder="Choice A, Choice B..." className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Correct Key</Label><Input name="correct_answer" defaultValue={editingItem?.correct_answer} className="rounded-xl h-11 font-mono text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold">Reference Media URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} className="rounded-xl h-11" /></div>
            <div className="flex items-center space-x-3 py-3 bg-slate-50 rounded-xl px-4 border">
               <input type="checkbox" name="required" id="q_required" className="w-5 h-5 rounded-md border-2 border-slate-300 accent-primary" defaultChecked={editingItem?.required === "TRUE" || editingItem?.required === true} />
               <Label htmlFor="q_required" className="font-black cursor-pointer">Compulsory Question</Label>
            </div>
            <DialogFooter><Button type="submit" className="rounded-full w-full h-12 font-black text-lg shadow-xl">Commit Question</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-100 p-8 border-b">
            <DialogTitle className="text-2xl font-black text-slate-900">{editingItem ? 'Edit User' : 'New Account'}</DialogTitle>
          </div>
          <form onSubmit={saveUser} className="p-8 space-y-6">
            <div className="space-y-2"><Label className="font-bold">Full Name</Label><Input name="name" defaultValue={editingItem?.name} required className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Email Address</Label><Input name="email" type="email" defaultValue={editingItem?.email} required disabled={!!editingItem} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Access Secret</Label><Input name="password" type="password" placeholder={editingItem ? "Leave to keep current" : "Set password"} required={!editingItem} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Permission Role</Label>
              <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-11 px-3 rounded-xl border bg-slate-50 font-bold outline-none">
                <option value="user">Student / User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <DialogFooter className="pt-4"><Button type="submit" className="rounded-full w-full h-12 font-black text-lg">Update Records</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkJsonOpen} onOpenChange={setIsBulkJsonOpen}>
        <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-950 p-8 text-white flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black">Bulk Data Sync</DialogTitle>
              <DialogDescription className="text-slate-400">Direct JSON manipulation for: {selectedTestId}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsBulkJsonOpen(false)} className="rounded-full text-white hover:bg-white/10">Discard</Button>
              <Button onClick={saveBulkQuestions} className="rounded-full bg-primary text-white font-bold px-6 shadow-lg shadow-primary/30"><Save className="w-4 h-4 mr-2" /> Push Changes</Button>
            </div>
          </div>
          <div className="flex-1 p-6 bg-slate-900">
            <textarea 
              className="w-full h-full font-mono text-xs p-8 bg-slate-950 text-green-400 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none" 
              value={questionJson} 
              onChange={(e) => setQuestionJson(e.target.value)} 
              spellCheck={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
