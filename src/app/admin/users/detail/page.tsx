
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Target,
  Database,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  Activity,
  Trophy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { AILoader } from '@/components/ui/ai-loader';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { Pagination } from '@/components/admin/Pagination';
import { trackEvent } from '@/lib/tracker';

function UserDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const email = searchParams.get('email') || "";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const threshold = Number(settings.default_pass_threshold || '70');

  const fetchData = async () => {
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/proxy/admin/users'),
        fetch('/api/proxy/admin/responses')
      ]);
      
      const uData = await uRes.json();
      const rData = await rRes.json();
      
      const foundUser = uData.find((u: any) => String(u.email || "").toLowerCase() === email.toLowerCase());
      const userResponses = rData
        .filter((r: any) => String(r['User Email'] || "").toLowerCase() === email.toLowerCase())
        .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
      
      setUser(foundUser);
      setResponses(userResponses);
      
      if (foundUser) {
        trackEvent('admin_student_view', { details: { studentId: email } });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not load user profile via proxy." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [email]);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: responses,
    searchFields: (r) => [String(r['Test ID'] || ''), String(r.Mode || '')],
    pageSize: 10
  });

  const stats = useMemo(() => {
    if (responses.length === 0) return { total: 0, uniqueTests: 0, passed: 0, avg: 0, best: 0 };
    
    let totalScore = 0;
    let totalPossible = 0;
    let passedCount = 0;
    const testIds = new Set();
    
    const percentages = responses.map(r => {
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      const p = (score / total) * 100;
      totalScore += score;
      totalPossible += total;
      testIds.add(r['Test ID']);
      if (p >= threshold) passedCount++;
      return p;
    });

    return {
      total: responses.length,
      uniqueTests: testIds.size,
      passed: passedCount,
      avg: Math.round((totalScore / (totalPossible || 1)) * 100),
      best: Math.round(Math.max(...percentages))
    };
  }, [responses, threshold]);

  const handleExportCSV = () => {
    if (responses.length === 0) return;
    
    const headers = ["Timestamp", "Test ID", "Mode", "Score", "Total", "Percentage", "Result"];
    const rows = responses.map(r => {
      const pct = Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100);
      return [
        new Date(r.Timestamp).toLocaleString(),
        r['Test ID'],
        r.Mode || 'test',
        r.Score,
        r.Total,
        `${pct}%`,
        pct >= threshold ? "PASS" : "FAIL"
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_${user?.name || 'Student'}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    trackEvent('admin_results_export', { details: { student: user?.email, count: responses.length } });
  };

  if (loading) return (
    <div className="py-32">
      <AILoader />
    </div>
  );

  if (!user || !email) return (
    <div className="text-center py-32 space-y-6">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
        <UserIcon className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Identity Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">The requested identity key could not be located in the DNTRNG registry.</p>
      <Button onClick={() => router.back()} className="rounded-full px-8">Return to Registry</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/users')} className="rounded-full font-bold h-12 px-6 hover:bg-white shadow-sm border border-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            disabled={responses.length === 0}
            className="rounded-full h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 bg-white dark:bg-slate-900 shadow-sm border-slate-200"
          >
            <Download className="w-4 h-4" /> Download Audit (CSV)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="h-32 bg-slate-900 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <div className="absolute top-0 right-0 p-6 opacity-5"><Target className="w-24 h-24 text-white" /></div>
            </div>
            <div className="px-8 pb-10 -mt-16 relative z-10 text-center">
              <div className="w-32 h-32 rounded-full border-8 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 mx-auto mb-6 flex items-center justify-center font-black text-4xl text-primary shadow-xl overflow-hidden">
                {user.image_url ? (
                  <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">{user.name}</h2>
              <Badge className="rounded-full bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none">
                {user.role} Operator
              </Badge>

              <div className="mt-10 space-y-4 text-left">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Mail className="w-4 h-4 text-slate-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Communication Key</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Shield className="w-4 h-4 text-slate-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Access Profile</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.role === 'admin' ? 'Root Administrator' : 'Standard Student'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 space-y-6">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Registry Clearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Progress to Goal</span>
                <span className="text-slate-900 dark:text-white">{stats.passed} / {stats.total} Cleared</span>
              </div>
              <Progress value={(stats.passed / (stats.total || 1)) * 100} className="h-2 rounded-full" />
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Summary</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  {stats.total} attempts across {stats.uniqueTests} unique tests, average precision score: <span className="text-primary font-black">{stats.avg}%</span>.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatSmall icon={Database} label="Sessions" value={stats.total} color="blue" />
            <StatSmall icon={Activity} label="Mean Score" value={`${stats.avg}%`} color="green" />
            <StatSmall icon={Trophy} label="Peak Record" value={`${stats.best}%`} color="purple" />
          </div>

          <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 min-h-[600px] flex flex-col border border-transparent dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Attempt History</CardTitle>
                  <CardDescription className="font-medium text-slate-500 dark:text-slate-400">Chronological list of all module interactions</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search by test name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 rounded-full bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {totalItems > 0 ? (
                <div className="flex flex-col h-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="px-8 font-black uppercase text-[9px] tracking-widest text-slate-400">Date & Time</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Assessment Module</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest text-center text-slate-400">Score</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest text-center text-slate-400">Verdict</TableHead>
                        <TableHead className="px-8 text-right font-black uppercase text-[9px] tracking-widest text-slate-400">Precision</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((resp, i) => {
                        const score = Number(resp.Score) || 0;
                        const total = Number(resp.Total) || 1;
                        const pct = Math.round((score / total) * 100);
                        const isPass = pct >= threshold;
                        
                        return (
                          <TableRow key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                            <TableCell className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-900 dark:text-white">
                                  {new Date(resp.Timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {new Date(resp.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-700 dark:text-slate-300 text-sm">{resp['Test ID']}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{resp.Mode || 'standard'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-slate-500">
                              <span className="text-slate-900 dark:text-white font-black">{score}</span>
                              <span className="text-[10px] text-slate-300 mx-1">/</span>
                              <span className="text-xs">{total}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                isPass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                              )}>
                                {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {isPass ? "Pass" : "Fail"}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                              <Badge className={cn(
                                "font-black px-3 py-1 rounded-full border-none shadow-sm text-[9px] uppercase tracking-widest",
                                pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= threshold ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                              )}>
                                {pct}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-auto">
                    <Pagination 
                      currentPage={currentPage}
                      totalItems={totalItems}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                  <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6">
                    <Filter className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Sessions Matched</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mt-2">Adjust your search parameters or check the full registry.</p>
                  <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 font-black uppercase text-[10px] text-primary">Clear Filter</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900"
  };
  
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all rounded-[2.5rem] border border-transparent dark:border-slate-800">
      <CardContent className="pt-6 flex items-center gap-5">
        <div className={cn("p-4 rounded-2xl border-2 transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black text-muted-foreground dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={
      <div className="py-32">
        <AILoader />
      </div>
    }>
      <UserDetailContent />
    </Suspense>
  );
}
