"use client";

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Users, 
  Target, 
  FileText,
  AlertCircle,
  Search,
  Trash2,
  RefreshCcw,
  Eye
} from "lucide-react";
import Link from 'next/link';
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
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartSkeleton } from './analytics/ChartSkeleton';

// Performance: Lazy load heavy Recharts components with skeleton fallback
const ResponsesAnalytics = dynamic(() => import('./analytics/ResponsesAnalytics'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
});

interface ResponsesTabProps {
  responses: any[];
  tests: any[];
  loading?: boolean;
  onRefresh: () => void;
  onDelete: (timestamp: string, email: string) => void;
}

export function ResponsesTab(props: ResponsesTabProps) {
  return (
    <ErrorBoundary>
      <ResponsesTabContent {...props} />
    </ErrorBoundary>
  );
}

function ResponsesTabContent({ responses, tests, loading, onRefresh, onDelete }: ResponsesTabProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deleteConfirm, setDeleteConfirm] = useState<{ timestamp: string, email: string } | null>(null);
  const [isAnalyticsInView, setIsAnalyticsInView] = useState(false);

  const threshold = Number(settings.default_pass_threshold || '70');
  const stats = useMemo(() => calculateResponseStats(responses || [], tests || [], threshold), [responses, tests, threshold]);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: responses || [],
    searchFields: (r) => [String(r['User Name'] || ''), String(r['User Email'] || ''), String(r['Test ID'] || '')],
    initialSort: { key: 'Timestamp', direction: 'desc' }
  });

  // Performance: Only render charts when they are likely to be viewed
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnalyticsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    const el = document.getElementById('analytics-viewport');
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
      <AlertCircle className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-6" />
      <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">{t('noResults')}</h3>
      <p className="text-slate-400 text-sm font-medium mt-2">{t('waitingFirst')}</p>
      <Button variant="outline" onClick={onRefresh} className="mt-8 rounded-full font-black uppercase text-[10px] tracking-widest gap-2">
        <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /> Force Registry Sync
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Page Heading Protocol */}
      <div className="px-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('results')}</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Registry Analytics & Global Telemetry</p>
      </div>

      {/* Top Stats Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard icon={Users} label="Global Sessions" value={stats.total} color="blue" />
        <AnalysisCard icon={Target} label={t('avgScore')} value={`${stats.avgScore}%`} color="green" />
        <AnalysisCard icon={Trophy} label={t('passRate')} value={`${stats.passRate}%`} color="purple" />
      </div>

      {/* Analytics Visualization Layer */}
      <div id="analytics-viewport">
        {isAnalyticsInView ? (
          <ResponsesAnalytics stats={stats} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        )}
      </div>

      {/* Chronological History Layer */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tight">Mission History</h2>
            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Audit trail of all assessment submissions</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64" role="search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <Input 
                placeholder="Filter by student or test..." 
                aria-label="Filter results by student name, email, or test ID"
                className="h-12 pl-12 rounded-full border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 focus:ring-primary/40 text-sm font-bold shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh} 
              aria-label="Refresh response registry"
              className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <RefreshCcw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin text-primary")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table aria-label="Assessment module submissions">
            <TableHeader>
              <TableRow className="bg-slate-50/30 dark:bg-slate-800/20 hover:bg-transparent border-none">
                <TableHead scope="col" className="px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">Timestamp</TableHead>
                <TableHead scope="col" className="font-black uppercase text-[10px] tracking-widest text-slate-400">Student Identity</TableHead>
                <TableHead scope="col" className="font-black uppercase text-[10px] tracking-widest text-slate-400">Assessment Module</TableHead>
                <TableHead scope="col" className="font-black uppercase text-[10px] tracking-widest text-slate-400">Precision</TableHead>
                <TableHead scope="col" className="px-10 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((r, i) => (
                <TableRow key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                  <TableCell className="px-10 py-6 text-[11px] font-bold text-slate-400 tabular-nums">
                    {new Date(r.Timestamp).toLocaleDateString()} {new Date(r.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/detail?email=${encodeURIComponent(r['User Email'])}`} className="font-black uppercase text-slate-700 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-2 group/link">
                      {r['User Name']}
                      <Eye className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover/link:text-primary transition-all" aria-hidden="true" />
                    </Link>
                  </TableCell>
                  <TableCell className="font-bold text-slate-500 dark:text-slate-400">{r['Test ID']}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white">{r.Score} / {r.Total}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        (Number(r.Score) / (Number(r.Total) || 1)) >= threshold/100 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100)}% Accuracy
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label={`Delete submission for ${r['User Name']}`}
                      className="opacity-0 group-hover:opacity-100 h-9 w-9 rounded-xl text-destructive hover:bg-rose-50 hover:text-rose-600 transition-all" 
                      onClick={() => setDeleteConfirm({ timestamp: r.Timestamp, email: r['User Email'] })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {totalItems === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <FileText className="w-12 h-12" aria-hidden="true" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No entries match your search registry</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      {/* Verification Overlay */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1 dark:border-slate-700 dark:text-slate-400">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { if(deleteConfirm) onDelete(deleteConfirm.timestamp, deleteConfirm.email); setDeleteConfirm(null); }}
              className="h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl shadow-destructive/20 border-none"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnalysisCard({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900"
  };
  return (
    <Card 
      className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 transition-all hover:shadow-md"
      aria-label={`${label}: ${value}`}
    >
      <CardContent className="pt-8 flex items-center gap-8 px-8">
        <div className={cn("p-6 rounded-[2rem] border-2", colors[color])} aria-hidden="true"><Icon className="w-8 h-8" /></div>
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground dark:text-slate-500 tracking-[0.3em] mb-1">{label}</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
