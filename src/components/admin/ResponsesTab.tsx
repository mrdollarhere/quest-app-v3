
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie,
  Legend,
  LabelList
} from "recharts";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  FileText,
  AlertCircle,
  Search,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Trash2,
  Download,
  RefreshCcw
} from "lucide-react";
import { useLanguage } from '@/context/language-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from './Pagination';

interface ResponsesTabProps {
  responses: any[];
  tests: any[];
  loading?: boolean;
  onRefresh: () => void;
  onDelete: (timestamp: string, email: string) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#f43f5e'];

export function ResponsesTab({ responses, tests, loading, onRefresh, onDelete }: ResponsesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'Timestamp', direction: 'desc' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ timestamp: string, email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { t } = useLanguage();

  const getTestTitle = (id: string) => {
    const test = tests.find(t => t.id === id);
    return test?.title || id;
  };

  // --- DATA ANALYSIS LOGIC ---
  
  const stats = useMemo(() => {
    if (!responses || responses.length === 0) return null;

    const total = responses.length;
    let totalScorePct = 0;
    let passes = 0;

    const gradeCounts = {
      Excellent: 0,
      Pass: 0,
      Fail: 0
    };

    const testStats: Record<string, { count: number; totalScore: number }> = {};

    responses.forEach(r => {
      const score = Number(r.Score) || 0;
      const totalQ = Number(r.Total) || 1;
      const pct = (score / totalQ) * 100;
      
      totalScorePct += pct;
      
      if (pct >= 50) passes++;
      
      if (pct >= 80) gradeCounts.Excellent++;
      else if (pct >= 50) gradeCounts.Pass++;
      else gradeCounts.Fail++;

      // Per test stats
      const testId = String(r['Test ID'] || 'Unknown');
      if (!testStats[testId]) testStats[testId] = { count: 0, totalScore: 0 };
      testStats[testId].count++;
      testStats[testId].totalScore += pct;
    });

    const gradeData = [
      { name: 'Excellent (80%+)', value: gradeCounts.Excellent, color: '#22c55e' },
      { name: 'Pass (50-79%)', value: gradeCounts.Pass, color: '#f59e0b' },
      { name: 'Fail (<50%)', value: gradeCounts.Fail, color: '#ef4444' }
    ];

    const testPerformanceData = Object.entries(testStats).map(([id, data]) => ({
      name: getTestTitle(id),
      avg: Math.round(data.totalScore / data.count),
      submissions: data.count
    })).sort((a, b) => b.avg - a.avg);

    return {
      total,
      avgScore: Math.round(totalScorePct / total),
      passRate: Math.round((passes / total) * 100),
      gradeData,
      testPerformanceData
    };
  }, [responses, tests]);

  // --- TABLE LOGIC (SEARCH & SORT) ---

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedResponses = useMemo(() => {
    if (!responses) return [];
    let result = [...responses];

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        String(r['User Name'] || '').toLowerCase().includes(term) ||
        String(r['User Email'] || '').toLowerCase().includes(term) ||
        String(getTestTitle(r['Test ID'])).toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'Score' || sortConfig.key === 'Total') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [responses, searchTerm, sortConfig, tests]);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedResponses = processedResponses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportToCSV = () => {
    const headers = ["Timestamp", "User Name", "User Email", "Test ID", "Test Name", "Score", "Total", "Percentage"];
    const rows = processedResponses.map(r => {
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      return [
        new Date(r.Timestamp).toLocaleString(),
        r['User Name'] || 'Guest',
        r['User Email'] || 'N/A',
        r['Test ID'],
        getTestTitle(r['Test ID']),
        score,
        total,
        `${Math.round((score/total)*100)}%`
      ];
    });
    
    const csvContent = [headers, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dntrng_results_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" /> 
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.timestamp, deleteConfirm.email);
      setDeleteConfirm(null);
    }
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-4" />
        <h3 className="text-xl font-black text-slate-400 dark:text-slate-600">{t('noResults')}</h3>
        <p className="text-slate-400 dark:text-slate-600 text-sm">{t('waitingFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard icon={Users} label="Total Results" value={stats.total} subValue="All synchronized tests" color="blue" />
        <AnalysisCard icon={Target} label={t('avgScore')} value={`${stats.avgScore}%`} subValue="Global mastery average" color="green" />
        <AnalysisCard icon={Trophy} label={t('passRate')} value={`${stats.passRate}%`} subValue="Students exceeding 50% target" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Distribution */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden border dark:border-slate-800 rounded-[2.5rem]">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-tight">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score Distribution
            </CardTitle>
            <CardDescription className="dark:text-slate-400 font-medium">Population density across performance tiers</CardDescription>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gradeData} layout="vertical" margin={{ right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={140} style={{ fontSize: '11px', fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={45}>
                  {stats.gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    style={{ fill: '#94a3b8', fontSize: '12px', fontWeight: 900 }}
                    formatter={(val: number) => `${val} operators`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Performance Donut */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden border dark:border-slate-800 rounded-[2.5rem]">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-tight">
              <FileText className="w-5 h-5 text-primary" />
              Efficiency by Module
            </CardTitle>
            <CardDescription className="dark:text-slate-400 font-medium">Mean alignment percentage per assessment</CardDescription>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.testPerformanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="avg"
                  nameKey="name"
                  stroke="none"
                >
                  {stats.testPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                  formatter={(value: number) => [`${value}% Avg`, 'Alignment']}
                />
                <Legend 
                  iconType="circle" 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Result History Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div>
                <CardTitle className="font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tighter">Result History</CardTitle>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Live Telemetry Feed</p>
              </div>
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                className="rounded-full h-12 px-6 border-2 font-black uppercase text-[10px] tracking-[0.2em] gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Find operator or module..." 
                  className="h-12 pl-12 rounded-full bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/40 text-sm font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh} 
                className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <RefreshCcw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin text-primary")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-none">
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-10 py-6 text-slate-400 cursor-pointer hover:text-primary" onClick={() => handleSort('Timestamp')}>
                  <div className="flex items-center">{t('date')} <SortIcon column="Timestamp" /></div>
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-4 text-slate-400 cursor-pointer hover:text-primary" onClick={() => handleSort('User Name')}>
                  <div className="flex items-center">{t('student')} <SortIcon column="User Name" /></div>
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-4 text-slate-400">{t('email')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-4 text-slate-400 cursor-pointer hover:text-primary" onClick={() => handleSort('Test ID')}>
                  <div className="flex items-center">Assessment <SortIcon column="Test ID" /></div>
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-4 text-slate-400 cursor-pointer hover:text-primary" onClick={() => handleSort('Score')}>
                  <div className="flex items-center">{t('score')} <SortIcon column="Score" /></div>
                </TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest px-4 text-center text-slate-400">Result</TableHead>
                <TableHead className="px-10 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.map((r, i) => {
                const score = Number(r.Score) || 0;
                const total = Number(r.Total) || 1;
                const pct = (score / total) * 100;
                const email = String(r['User Email'] || '');
                const displayEmail = (!email || email.toLowerCase() === 'anonymous' || email.toLowerCase() === 'n/a') ? "—" : email;
                
                return (
                  <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group border-b border-slate-50 dark:border-slate-800 last:border-none">
                    <TableCell className="px-10 py-6 text-[11px] font-bold text-slate-400 tabular-nums">
                      {new Date(r.Timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 font-black text-slate-900 dark:text-white truncate max-w-[150px] uppercase tracking-tight">{String(r['User Name'] || 'Guest')}</TableCell>
                    <TableCell className="px-4 font-medium text-slate-400 truncate max-w-[150px] italic">{displayEmail}</TableCell>
                    <TableCell className="px-4 font-black text-slate-700 dark:text-white truncate max-w-[200px]">
                      <div className="flex flex-col">
                        <span className="truncate">{getTestTitle(String(r['Test ID']))}</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter opacity-60">ID: {String(r['Test ID'])}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 font-black text-slate-700 dark:text-slate-300 tabular-nums">{score} / {total}</TableCell>
                    <TableCell className="px-4 text-center">
                      <Badge className={cn(
                        "font-black px-4 py-1.5 rounded-full border-none shadow-sm text-[9px] uppercase tracking-[0.2em]",
                        pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                      )}>
                        {pct >= 80 ? t('excellent') : pct >= 50 ? t('pass') : t('fail')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={() => setDeleteConfirm({ timestamp: r.Timestamp, email: r['User Email'] })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {processedResponses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-32 bg-slate-50/20 dark:bg-slate-900/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search className="w-12 h-12" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No matching results in registry</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {processedResponses.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalItems={processedResponses.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Purge Assessment Log?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently remove this entry from the historical registry. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1 dark:border-slate-700 dark:text-slate-400">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl border-none"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnalysisCard({ icon: Icon, label, value, subValue, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    green: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    purple: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30"
  };
  
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all rounded-[2.5rem] border dark:border-slate-800">
      <CardContent className="pt-8 flex items-center gap-8 px-8">
        <div className={cn("p-6 rounded-[2rem] border-2 transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">{label}</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
}
