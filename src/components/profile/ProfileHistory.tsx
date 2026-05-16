"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { History, Target, ChevronRight, BookOpen, Clock, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracker';
import { Pagination } from '@/components/admin/Pagination';

interface ProfileHistoryProps {
  responses: any[];
  settings: Record<string, string>;
  hasHistory: boolean;
}

const REGISTRY_PAGE_SIZE = 5;

export function ProfileHistory({ responses, settings, hasHistory }: ProfileHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * REGISTRY_PAGE_SIZE;
    return responses.slice(start, start + REGISTRY_PAGE_SIZE);
  }, [responses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [responses.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <History className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Interaction Registry</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit of historical assessment nodes</p>
          </div>
        </div>
        {hasHistory && (
          <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              Total Sessions: {responses.length}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {hasHistory ? (
          <>
            {paginatedResponses.map((r: any, i: number) => {
              const score = Number(r.Score) || 0;
              const total = Number(r.Total) || 1;
              const pct = Math.round((score / total) * 100);
              const threshold = Number(settings.default_pass_threshold || '70');
              const isPass = pct >= threshold;

              return (
                <div key={`${r.Timestamp}-${i}`} className="group flex flex-col sm:flex-row items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all group-hover:scale-110",
                    isPass 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 text-emerald-600" 
                      : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900 text-rose-600"
                  )}>
                    <Target className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-2">{r['Test ID']}</h4>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(r.Timestamp).toLocaleDateString()}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                        <Activity className="w-3 h-3" />
                        {score}/{total} Points Achieved
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm",
                      isPass ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {isPass ? "Mastered" : "Incomplete"}
                    </Badge>
                    <Link 
                      href={`/quiz?id=${r['Test ID']}`} 
                      className="w-full sm:w-auto"
                      onClick={() => trackEvent('quiz_retake_from_profile', { 
                        test_id: r['Test ID'],
                        test_name: r['Test ID'] 
                      })}
                    >
                      <Button variant="outline" className="w-full h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2">
                        Initialize Retake <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {responses.length > REGISTRY_PAGE_SIZE && (
              <div className="mt-4">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={responses.length}
                  pageSize={REGISTRY_PAGE_SIZE}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    // Scroll to top of history section
                    const el = document.getElementById('history-top');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent border-none px-0"
                />
              </div>
            )}
          </>
        ) : (
          <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center gap-8 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-700 shadow-inner group-hover:scale-105 transition-transform">
              <BookOpen className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registry Uninitialized</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                Complete your first intelligence assessment to initialize your history and unlock detailed performance metrics.
              </p>
            </div>
            <Link href="/tests">
              <Button className="h-16 px-10 rounded-full bg-slate-900 dark:bg-primary text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl border-none hover:scale-[1.02] transition-all">
                Browse Assessment Bank
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div id="history-top" />
    </div>
  );
}
