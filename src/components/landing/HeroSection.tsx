/**
 * HeroSection.tsx
 * 
 * Purpose: Primary visual entry point for the landing gateway.
 * Logic: Renders high-fidelity brand messaging, system stats, and the primary assessment call-to-action.
 */

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  t: (key: string) => string;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="relative pt-24 pb-32 md:pt-40 md:pb-52 px-6 overflow-hidden">
      {/* Decorative Aura Nodes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 text-center md:text-left space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {t('heroBadge')}
          </div>
          <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
            {t('heroTitle').split('.')[0]}<span className="text-primary">.</span> <br />
            {t('heroTitle').split('.')[1]}
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-5 pt-6">
            <Link href="/tests">
              <Button size="lg" className="h-20 px-12 text-xl rounded-full bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/30 border-none group">
                {t('browseTests')} <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-20 px-12 text-xl rounded-full bg-white border-4 border-slate-100 text-slate-900 font-black hover:bg-slate-50 transition-all">
                Access Portal
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8 pt-10">
            <HeroStat label="Active Modules" value="40+" />
            <div className="h-8 w-px bg-slate-200" />
            <HeroStat label="Identity Nodes" value="1.2k+" />
            <div className="h-8 w-px bg-slate-200" />
            <HeroStat label="Registry Uptime" value="100%" />
          </div>
        </div>

        <div className="flex-1 hidden lg:block animate-in fade-in slide-in-from-right-12 duration-1000">
          <div className="relative p-12">
            <div className="absolute inset-0 bg-white rounded-[4rem] shadow-2xl border border-slate-100 -rotate-2" />
            <div className="relative bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl aspect-[4/3] flex items-center justify-center border-8 border-white group">
              <Image 
                src="https://picsum.photos/seed/dntrng_ui/800/600" 
                alt="DNTRNG Interface" 
                fill 
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 space-y-2">
                   <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Operational Protocol</p>
                   <p className="text-white font-bold text-lg">Deep Intelligence Mapping v18.9</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    </div>
  );
}
