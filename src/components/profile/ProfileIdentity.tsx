"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PerformanceGauge } from '@/components/quiz/PerformanceGauge';

interface ProfileIdentityProps {
  user: any;
  stats: { avg: number };
  hasHistory: boolean;
}

export function ProfileIdentity({ user, stats, hasHistory }: ProfileIdentityProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative z-10">{user?.displayName?.charAt(0).toUpperCase()}</span>
      </div>
      <div className="text-center md:text-left flex-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{user?.displayName}</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
        <div className="flex items-center gap-3 mt-6">
          <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest">
            Student Operator
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-400">
            Level 1 Clearance
          </Badge>
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center">
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
