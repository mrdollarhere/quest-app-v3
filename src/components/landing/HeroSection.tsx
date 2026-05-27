/**
 * HeroSection.tsx
 * 
 * Purpose: Primary visual entry point for the landing gateway.
 * Refactored: v19.2.0 - Integrated QuickSignIn card.
 * Updated: v19.7.0 - Integrated real-time global statistics.
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { QuickSignIn } from './QuickSignIn';

interface HeroSectionProps {
  t: (key: string) => string;
  stats?: {
    learningSessions: number;
    studentsTrained: number;
    assessmentsDone: number;
    practiceModules: number;
  };
}

export function HeroSection({ t, stats }: HeroSectionProps) {
  const formattedStats = {
    modules: stats?.practiceModules || "40+",
    students: stats?.studentsTrained > 100 ? `${(stats.studentsTrained / 1000).toFixed(1)}k+` : (stats?.studentsTrained || "1.2k+"),
    uptime: "100%"
  };

  return (
    <section className="relative pt-24 pb-32 md:pt-40 md:pb-52 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-[1.2] text-center lg:text-left space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {t('heroBadge')}
          </div>
          <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 pt-6">
            <Link href="/tests">
              <Button size="lg" className="h-20 px-12 text-xl rounded-full bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/30 border-none group">
                {t('browseTests')} <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-10">
            <HeroStat label="Active Modules" value={String(formattedStats.modules)} />
            <div className="h-8 w-px bg-slate-200" />
            <HeroStat label="Identity Nodes" value={String(formattedStats.students)} />
            <div className="h-8 w-px bg-slate-200" />
            <HeroStat label="Registry Uptime" value={formattedStats.uptime} />
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <QuickSignIn />
          <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.6em] select-none">
              Intelligence Interface v19.7
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</p>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    </div>
  );
}
