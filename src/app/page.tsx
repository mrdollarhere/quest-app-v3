/**
 * page.tsx
 * 
 * Route: /
 * Purpose: Primary landing gateway highlighting the platform's real-time assessment capabilities.
 * Updated: v18.9.5 - Content audit for real-time features.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Zap, Target, Radio, Users, BarChart3, ChevronRight } from "lucide-react";
import { UserNav } from '@/components/UserNav';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { JsonLd } from '@/components/SEO';
import { trackEvent } from '@/lib/tracker';
import { SiteFooter } from '@/components/SiteFooter';

export default function LandingPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [systemStatus, setSystemStatus] = useState('Optimal');
  const lastTracked = useRef<string | null>(null);

  const brandName = String(settings.platform_name || "DNTRNG");

  useEffect(() => {
    const key = 'page_view_home' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view_home');

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setSystemStatus(data.status || 'Offline');
      } catch (err) {
        setSystemStatus('Offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col selection:bg-[#2563EB] selection:text-white font-sans">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "name": brandName }} />
      
      {settings.announcement_banner && (
        <div className="bg-[#2563EB] text-white py-3 px-6 text-center relative overflow-hidden group">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SYSTEM BROADCAST
            </div>
            <p className="text-xs md:text-sm font-bold tracking-tight">{settings.announcement_banner}</p>
          </div>
        </div>
      )}

      <header className="py-4 px-6 md:px-12 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/brand/logo-horizontal.png" alt={brandName} width={160} height={40} priority />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
            <Link href="/tests" className="hover:text-[#2563EB] transition-colors">{t('library')}</Link>
            <Link href="/join" className="hover:text-rose-500 transition-colors flex items-center gap-2">
              <Radio className="w-3 h-3 text-rose-500" /> Live Classroom
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 text-center md:text-left space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-current" />
                Live Assessment Protocol Active
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
                Synchronized <br /> Intelligence.
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                Transform any assessment into a real-time classroom experience. Host live sessions, track student progress instantly, and generate detailed performance analytics.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
                <Link href="/join">
                  <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-rose-500 hover:bg-rose-600 font-black shadow-xl shadow-rose-500/20 border-none">
                    Join Live Mission <ChevronRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/tests">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full bg-white border-2 border-slate-200 text-slate-900 font-black">
                    Browse Library
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden md:block animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent blur-[100px] opacity-50" />
                <Image src="/brand/hero-visual.png" alt="DNTRNG Interface" width={600} height={450} className="relative z-10 object-contain drop-shadow-2xl" priority />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard icon={Radio} title="Real-Time Sync" desc="Pusher-powered websocket connectivity ensures sub-second synchronization between host and student nodes." />
            <FeatureCard icon={Users} title="Classroom Control" desc="Teachers maintain absolute control over question advancement, reveal protocols, and session termination." />
            <FeatureCard icon={BarChart3} title="Deep Analytics" desc="Detailed leaderboard metrics and per-question success rates provided instantly upon mission completion." />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-4 p-8 rounded-[2.5rem] hover:bg-slate-50 transition-colors group">
      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
