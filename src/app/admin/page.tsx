
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  LayoutGrid, 
  Settings, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  FileText,
  Users,
  BarChart3,
  ExternalLink,
  Search,
  AlertCircle,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL } from '@/lib/api-config';
import { Question } from '@/types/quiz';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/use-user-role';

export default function AdminDashboard() {
  const { role, loading: roleLoading, user } = useUserRole();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchAllData = async () => {
    if (!API_URL) {
      setStatus('error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
        setStatus('success');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not fetch data from your Google Sheet. Check your API URL and deployment.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchAllData();
    }
  }, [role]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-bold">Verifying Permissions...</p>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2rem] text-center p-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-black mb-4">Access Denied</CardTitle>
          <p className="text-muted-foreground mb-8">
            You do not have administrative privileges. Please ensure your email (<strong>{user?.email}</strong>) is listed as an 'admin' in the Google Sheet's <strong>Users</strong> tab.
          </p>
          <Link href="/">
            <Button className="rounded-full w-full h-12 font-bold shadow-lg">Return to Library</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const tests = Array.from(new Set(questions.map(q => (q as any).test_id))).filter(Boolean);
  
  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q as any).test_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                QuestFlow Admin
              </h1>
              <p className="text-xs text-muted-foreground font-medium">System Role: {role.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
              status === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : status === 'error' ? <XCircle className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3 animate-spin" />}
              {status === 'success' ? 'API Connected' : status === 'error' ? 'API Error' : 'Checking...'}
            </div>
            <Button size="sm" onClick={fetchAllData} disabled={loading} className="rounded-full">
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Questions</p>
                  <p className="text-2xl font-black">{questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Tests</p>
                  <p className="text-2xl font-black">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Avg. Completion</p>
                  <p className="text-2xl font-black">-- %</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Submissions</p>
                  <p className="text-2xl font-black">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border">
            <TabsTrigger value="questions" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Live Questions
            </TabsTrigger>
            <TabsTrigger value="tests" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Test Config
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              System Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Questions Pool</CardTitle>
                  <CardDescription>Direct view of the questions currently served by your API.</CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search questions or test IDs..." 
                    className="pl-10 rounded-full bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[100px]">Test ID</TableHead>
                        <TableHead>Question Text</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Correct Answer</TableHead>
                        <TableHead className="text-right">Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((q, i) => (
                          <TableRow key={i}>
                            <TableCell><Badge variant="outline" className="font-mono">{(q as any).test_id || 'N/A'}</Badge></TableCell>
                            <TableCell className="font-medium max-w-md truncate">{q.question_text}</TableCell>
                            <TableCell>
                              <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-tighter">
                                {q.question_type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-mono max-w-[200px] truncate">
                              {q.correct_answer || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {q.required ? <CheckCircle2 className="w-4 h-4 text-green-500 inline" /> : <XCircle className="w-4 h-4 text-slate-200 inline" />}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                            {loading ? "Fetching latest data..." : "No questions found in your sheet."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map(testId => {
                const testQuestions = questions.filter(q => (q as any).test_id === testId);
                return (
                  <Card key={testId} className="border-none shadow-sm overflow-hidden">
                    <div className="h-2 bg-primary" />
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {testId}
                        <Link href={`/quiz?id=${testId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardTitle>
                      <CardDescription>Configuration for this specific test ID.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Questions</span>
                        <span className="font-bold">{testQuestions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">With Images</span>
                        <span className="font-bold">{testQuestions.filter(q => q.image_url).length}</span>
                      </div>
                      <div className="pt-4 border-t flex flex-wrap gap-2">
                        {Array.from(new Set(testQuestions.map(q => q.question_type))).map(type => (
                          <Badge key={type} variant="secondary" className="text-[10px] uppercase px-2 py-0">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>API Connection Logs</CardTitle>
                <CardDescription>Review raw technical data and connection status details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-green-400 overflow-x-auto space-y-2">
                  <p>[{new Date().toISOString()}] INITIALIZING_FETCH...</p>
                  <p>[{new Date().toISOString()}] ENDPOINT: {API_URL?.substring(0, 40)}...</p>
                  <p>[{new Date().toISOString()}] STATUS: {status.toUpperCase()}</p>
                  <p>[{new Date().toISOString()}] DATA_POINTS: {questions.length}</p>
                  {status === 'error' && (
                    <p className="text-red-400">[{new Date().toISOString()}] ERROR: FAILED_TO_PARSE_JSON. Check CORS or GAS permissions.</p>
                  )}
                </div>
                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">To see individual user responses, open your Google Sheet's "Responses" tab directly.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
