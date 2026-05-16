/**
 * page.tsx
 * 
 * Route: /
 * Purpose: Primary landing gateway redesigned to focus on knowledge exploration and assessment library.
 * Updated: v18.9.7 - Shifted focus from Live Missions to the Assessment Library per user patterns.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Target, 
  BookOpen, 
  BarChart3, 
  ChevronRight, 
  Database, 
  Layers, 
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { UserNav } from '@/components/UserNav';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { JsonLd } from '@/components/SEO';
import { trackEvent } from '@/lib/tracker';
import { SiteFooter } from '@/components/SiteFooter';
import { useAuth } from '@/context/auth-context';

export default function LandingPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#2563EB] selection:text-white font-sans">
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

      <header className="py-4 px-6 md:px-12 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/brand/logo-horizontal.png" alt={brandName} width={150} height={38} priority />
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/tests" className="hover:text-primary transition-colors">{t('library')}</Link>
            {user && (
              <Link href="/profile" className="hover:text-primary transition-colors">{t('profile')}</Link>
            )}
            <Link href="/join" className="hover:text-rose-500 transition-colors">{t('joinLive')}</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Modern Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-40 md:pb-52 px-6 overflow-hidden">
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

        {/* Feature Grid Section */}
        <section className="py-32 bg-white border-y border-slate-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">{t('statusActive')}</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-none">The Core Intelligence Engine.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={Layers} 
                title="11+ Interaction Types" 
                desc="From spatial hotspots to complex matrix mapping, our engine supports every assessment modality." 
              />
              <FeatureCard 
                icon={BarChart3} 
                title="Precision Analytics" 
                desc="Deep-dive into your performance with 1000-point Intel Indexes and step-by-step diagnostic audits." 
              />
              <FeatureCard 
                icon={Database} 
                title="Registry Synchronized" 
                desc="Powered by Google Sheets, ensuring total data ownership and sub-second registry handshakes." 
              />
              <FeatureCard 
                icon={LayoutGrid} 
                title="Identity Tracking" 
                desc="A centralized interaction history that documents your growth across every assessment mission." 
              />
            </div>
          </div>
        </section>

        {/* Tactical Section */}
        <section className="py-32 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
              
              <div className="flex-1 space-y-8 relative z-10">
                <h3 className="text-4xl md:text-6xl font-black text-white uppercase leading-[0.9] tracking-tighter">
                  Ready to test your <br /> <span className="text-primary">alignment?</span>
                </h3>
                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                  Entry into the intelligence registry is open. No account required to initialize your first mission. Browse our curated bank of assessments now.
                </p>
                <div className="pt-4">
                  <Link href="/tests">
                    <Button className="h-16 px-10 rounded-full bg-white text-slate-900 font-black text-lg shadow-xl hover:scale-[1.02] transition-transform border-none">
                      Launch Library Terminal
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <TacticalBadge icon={Target} label="High Accuracy" />
                  <TacticalBadge icon={BookOpen} label="Curated Content" />
                  <TacticalBadge icon={Zap} label="Instant Verdict" />
                  <TacticalBadge icon={Database} label="Sync Ready" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6 p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
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

function TacticalBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center gap-3 w-40">
      <Icon className="w-6 h-6 text-primary" />
      <span className="text-[10px] font-black uppercase text-white tracking-widest text-center">{label}</span>
    </div>
  );
}
