"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PerformanceGauge } from '@/components/quiz/PerformanceGauge';
import { cn } from "@/lib/utils";

interface ProfileIdentityProps {
  user: any;
  stats: { avg: number };
  hasHistory: boolean;
}

export function ProfileIdentity({ user, stats, hasHistory }: ProfileIdentityProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-900 dark:bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative z-10">{user?.displayName?.charAt(0).toUpperCase()}</span>
      </div>
      <div className="text-center md:text-left flex-1">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-2">
          {user?.displayName || 'Student Operator'}
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
        <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
          <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest">
            {user?.role === 'admin' ? 'Root Administrator' : 'Standard Student'}
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-700 text-slate-400">
            Node: {hasHistory ? 'Active' : 'Uninitialized'}
          </Badge>
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <PerformanceGauge 
          percentage={stats.avg} 
          score={0} 
          totalQuestions={0} 
          compact={true} 
          hasData={hasHistory}
        />
      </div>
    </div>
  );
}