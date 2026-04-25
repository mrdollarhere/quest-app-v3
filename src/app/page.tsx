"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Zap,
  ArrowRight,
  Target,
  ImageIcon,
  ListOrdered,
  BarChart3,
} from "lucide-react";
import { UserNav } from '@/components/UserNav';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { JsonLd } from '@/components/SEO';
import { trackEvent } from '@/lib/tracker';

type SystemStatus = 'Optimal' | 'Degraded' | 'Offline';

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const { settings } = useSettings();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('Optimal');
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
        if (!res.ok) throw new Error('Health check failed');
        const data = await res.json();
        setSystemStatus(data.status as SystemStatus);
      } catch (err) {
        setSystemStatus('Offline');
      }
    };
    checkHealth();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brandName,
    "url": "https://quest-dntrng.vercel.app",
    "description": "High-performance precision assessment platform powered by Google Sheets.",
    "logo": settings.logo_url || "https://quest-dntrng.vercel.app/brand/logo-horizontal.png"
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col selection:bg-[#2563EB] selection:text-white font-sans">
      <JsonLd data={structuredData} />
      
      {settings.announcement_banner && (
        <div className="bg-[#2563EB] text-white py-3 px-6 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" aria-hidden="true" />
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
              {t('registryBroadcast')}
            </div>
            <p className="text-xs md:text-sm font-bold tracking-tight">
              {settings.announcement_banner}
            </p>
          </div>
        </div>
      )}

      <header className="py-4 px-6 md:px-12 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center" aria-label={brandName}>
            <div className="hidden sm:block">
              <Image src="/brand/logo-horizontal.png" alt={brandName} width={160} height={40} priority />
            </div>
            <div className="sm:hidden">
              <Image src="/brand/logo-symbol.png" alt={brandName} width={40} height={40} priority />
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
            <Link href="/tests" className="hover:text-[#2563EB] transition-colors">{t('library')}</Link>
            <Link href="/setup-guide" className="hover:text-[#2563EB] transition-colors">{t('setupGuide')}</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner" role="group" aria-label="Language Selector">
              {['en', 'vi', 'es'].map((l) => (
                <button 
                  key={l}
                  onClick={() => setLanguage(l as any)} 
                  aria-label={`Switch to ${l.toUpperCase()}`}
                  className={cn("px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all focus-visible:ring-2", language === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/tests" className="hidden sm:block">
              <Button className="h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-6 transition-all shadow-md hover:shadow-lg">
                {t('startQuiz')} →
              </Button>
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-current" aria-hidden="true" />
                {t('heroBadge')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">{t('heroTitle')}</h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">{t('heroSubtitle')}</p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
                <Link href="/tests"><Button size="lg" className="h-16 px-10 text-lg rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] font-black shadow-xl"> {t('browseTests')} </Button></Link>
                <Link href="/quiz?id=demo-full" onClick={() => trackEvent('test_card_click', { test_id: 'demo-full', test_name: 'Master Protocol Showcase' })}><Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full bg-white border-2 border-slate-200 text-slate-900 font-black"> {t('tryDemo')} </Button></Link>
              </div>
            </div>
            <div className="flex-1 hidden md:block animate-in fade-in slide-in-from-right-8 duration-1000">
              <Image src="/brand/hero-visual.png" alt="DNTRNG Interface" width={600} height={400} className="object-contain" priority />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 gap-8">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
              {settings.custom_footer_text || `© ${new Date().getFullYear()} DNTRNG • PRECISION ASSESSMENT`}
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", systemStatus === 'Optimal' ? "bg-emerald-500" : systemStatus === 'Degraded' ? "bg-amber-500" : "bg-red-500")} aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('systemStatus')}: {t(systemStatus.toLowerCase())}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
