"use client";

import React from 'react';
import Link from 'next/link';
import { History, Target, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracker';

interface ProfileHistoryProps {
  responses: any[];
  settings: Record<string, string>;
  hasHistory: boolean;
}

export function ProfileHistory({ responses, settings, hasHistory }: ProfileHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Interaction Registry</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {responses.map((r: any, i: number) => {
          const score = Number(r.Score) || 0;
          const total = Number(r.Total) || 1;
          const pct = Math.round((score / total) * 100);
          const threshold = Number(settings.default_pass_threshold || '70');
          const isPass = pct >= threshold;

          return (
            <div key={i} className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-colors",
                isPass ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
              )}>
                <Target className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight mb-1">{r['Test ID']}</h4>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(r.Timestamp).toLocaleDateString()}
                  </p>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{score}/{total} Points</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={cn(
                  "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none",
                  isPass ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {isPass ? "Mastered" : "Needs Practice"}
                </Badge>
                <Link href={`/quiz?id=${r['Test ID']}`} onClick={() => trackEvent('quiz_retake', { test_id: r['Test ID'] })}>
                  <Button variant="outline" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-50 transition-all gap-2">
                    Retake <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
        
        {!hasHistory && (
          <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 shadow-inner">
              <BookOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Registry Clean</h4>
              <p className="text-sm font-medium text-slate-400 max-w-[280px] mx-auto">Complete your first assessment to unlock detailed analytics and historical tracking.</p>
            </div>
            <Link href="/tests">
              <Button className="h-12 px-8 rounded-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl border-none">Browse Intelligence Library</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
