
"use client";

import React, { useMemo } from 'react';
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
  Legend
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
import { useSettings } from '@/context/settings-context';
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
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { calculateResponseStats } from '@/lib/analytics-utils';

interface ResponsesTabProps {
  responses: any[];
  tests: any[];
  loading?: boolean;
  onRefresh: () => void;
  onDelete: (timestamp: string, email: string) => void;
}

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ec4899', '#f43f5e'];

export function ResponsesTab({ responses, tests, loading, onRefresh, onDelete }: ResponsesTabProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ timestamp: string, email: string } | null>(null);

  const threshold = Number(settings.default_pass_threshold || '70');
  const stats = useMemo(() => calculateResponseStats(responses, tests, threshold), [responses, tests, threshold]);

  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: responses,
    searchFields: (r) => [String(r['User Name'] || ''), String(r['User Email'] || ''), String(r['Test ID'] || '')],
    initialSort: { key: 'Timestamp', direction: 'desc' }
  });

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-2 border-dashed">
      <AlertCircle className="w-12 h-12 text-slate-200 mb-4" />
      <h3 className="text-xl font-black text-slate-400">{t('noResults')}</h3>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard icon={Users} label="Results" value={stats.total} color="blue" />
        <AnalysisCard icon={Target} label={t('avgScore')} value={`${stats.avgScore}%`} color="green" />
        <AnalysisCard icon={Trophy} label={t('passRate')} value={`${stats.passRate}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3"><TrendingUp className="w-5 h-5 text-primary" />Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gradeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} style={{ fontSize: '11px', fontWeight: 800 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                  {stats.gradeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3"><FileText className="w-5 h-5 text-primary" />Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.testPerformanceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="avg">
                  {stats.testPerformanceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b p-10 flex flex-row items-center justify-between">
          <CardTitle className="font-black text-3xl uppercase">History</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search..." className="h-12 pl-12 rounded-full border-none ring-1 ring-slate-100" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-12 w-12"><RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/50"><TableHead className="px-10">Date</TableHead><TableHead>Student</TableHead><TableHead>Test ID</TableHead><TableHead>Score</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginatedData.map((r, i) => (
                <TableRow key={i} className="group">
                  <TableCell className="px-10 py-6 text-[11px] font-bold text-slate-400">{new Date(r.Timestamp).toLocaleDateString()}</TableCell>
                  <TableCell className="font-black uppercase">{r['User Name']}</TableCell>
                  <TableCell className="font-bold text-slate-500">{r['Test ID']}</TableCell>
                  <TableCell className="font-black">{r.Score}/{r.Total}</TableCell>
                  <TableCell className="px-10 text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => setDeleteConfirm({ timestamp: r.Timestamp, email: r['User Email'] })}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10">
          <AlertDialogHeader><AlertDialogTitle>Purge Log?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Abort</AlertDialogCancel><AlertDialogAction onClick={() => { if(deleteConfirm) onDelete(deleteConfirm.timestamp, deleteConfirm.email); setDeleteConfirm(null); }}>Purge</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnalysisCard({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };
  return (
    <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
      <CardContent className="pt-8 flex items-center gap-8 px-8">
        <div className={cn("p-6 rounded-[2rem] border-2", colors[color])}><Icon className="w-8 h-8" /></div>
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
