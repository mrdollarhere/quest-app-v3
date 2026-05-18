
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Users, Target, Trophy, AlertCircle, Search, RefreshCcw, ArrowUpDown, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from './Pagination';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { calculateResponseStats } from '@/lib/analytics-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartSkeleton } from './analytics/ChartSkeleton';
import { ResponseTableRow } from './responses/ResponseTableRow';
import { cn } from '@/lib/utils';

const ResponsesAnalytics = dynamic(() => import('./analytics/ResponsesAnalytics'), {
  ssr: false,
  loading: () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><ChartSkeleton /><ChartSkeleton /></div>
});

export function ResponsesTab(props: any) {
  return <ErrorBoundary><ResponsesTabContent {...props} /></ErrorBoundary>;
}

function ResponsesTabContent({ responses, tests, loading, onRefresh, onDelete }: any) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [isAnalyticsInView, setIsAnalyticsInView] = useState(false);
  const threshold = Number(settings.default_pass_threshold || '70');
  const stats = useMemo(() => calculateResponseStats(responses || [], tests || [], threshold), [responses, tests, threshold]);

  const { searchTerm, setSearchTerm, currentPage, setCurrentPage, paginatedData, totalItems, pageSize, sortConfig, handleSort } = useRegistryFilter({
    data: responses || [],
    searchFields: (r) => [String(r['User Name'] || ''), String(r['User Email'] || ''), String(r['Test ID'] || '')],
    initialSort: { key: 'Timestamp', direction: 'desc' }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsAnalyticsInView(true); observer.disconnect(); } }, { rootMargin: '200px' });
    const el = document.getElementById('analytics-viewport');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!stats) return <div className="py-32 text-center opacity-30"><AlertCircle className="w-16 h-16 mx-auto mb-6" /><p className="font-black uppercase tracking-widest">{t('noResults')}</p></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard icon={Users} label="Global Sessions" value={stats.total} color="blue" />
        <AnalysisCard icon={Target} label={t('avgScore')} value={`${stats.avgScore}%`} color="green" />
        <AnalysisCard icon={Trophy} label={t('passRate')} value={`${stats.passRate}%`} color="purple" />
      </div>

      <div id="analytics-viewport">{isAnalyticsInView ? <ResponsesAnalytics stats={stats} /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><ChartSkeleton /><ChartSkeleton /></div>}</div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <CardTitle className="font-black text-3xl uppercase tracking-tight">Mission History</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Filter registry..." className="h-12 pl-12 rounded-full border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-12 w-12"><RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-slate-50/30 dark:bg-slate-800/20 hover:bg-transparent border-none">
              {['Timestamp', 'Student Identity', 'Assessment Module', 'Precision', 'Actions'].map((h, i) => (
                <TableHead key={h} className={cn("px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer", i === 4 && "text-right")} onClick={() => i < 4 && handleSort(h.includes('Time') ? 'Timestamp' : h.includes('Identity') ? 'User Name' : h.includes('Module') ? 'Test ID' : 'Score')}>{h}</TableHead>
              ))}
            </TableRow></TableHeader>
            <TableBody>
              {paginatedData.map((r, i) => <ResponseTableRow key={i} r={r} threshold={threshold} onDelete={() => setDeleteConfirm({ timestamp: r.Timestamp, email: r['User Email'] })} />)}
              {totalItems === 0 && <TableRow><TableCell colSpan={5} className="py-24 text-center opacity-20"><FileText className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase text-xs">Registry Empty</p></TableCell></TableRow>}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader><AlertDialogTitle className="text-3xl font-black uppercase">Delete Record?</AlertDialogTitle><AlertDialogDescription className="text-lg font-medium text-slate-500 leading-relaxed">This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4"><AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase flex-1">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if(deleteConfirm) onDelete(deleteConfirm.timestamp, deleteConfirm.email); setDeleteConfirm(null); }} className="h-14 rounded-full bg-destructive text-white font-black uppercase flex-1 border-none shadow-xl shadow-destructive/20">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnalysisCard({ icon: Icon, label, value, color }: any) {
  const colors: any = { blue: "bg-blue-50 text-blue-600 border-blue-100", green: "bg-green-50 text-green-600 border-green-100", purple: "bg-purple-50 text-purple-600 border-purple-100" };
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex items-center gap-8"><div className={cn("p-6 rounded-[2rem] border-2", colors[color])}><Icon className="w-8 h-8" /></div><div><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">{label}</p><p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p></div></Card>
  );
}
