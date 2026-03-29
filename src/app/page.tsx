"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Database, 
  CheckCircle, 
  Zap,
  ArrowRight,
  Target,
  Image as ImageIcon,
  ListOrdered,
  BarChart3,
  Languages,
  CheckCircle2
} from "lucide-react";
import { UserNav } from '@/components/UserNav';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { ModeToggle } from '@/components/ModeToggle';

type SystemStatus = 'Optimal' | 'Degraded' | 'Offline';

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('Optimal');

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col selection:bg-[#2563EB] selection:text-white font-sans">
      {/* Navigation */}
      <header className="py-4 px-6 md:px-12 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase flex items-center">
              DNTRNG<span className="w-2 h-2 rounded-full bg-[#2563EB] ml-1" />
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
            <Link href="/tests" className="hover:text-[#2563EB] transition-colors">{t('library')}</Link>
            <Link href="/setup-guide" className="hover:text-[#2563EB] transition-colors">{t('setupGuide')}</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
              <button 
                onClick={() => setLanguage('en')} 
                className={cn("px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all", language === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('vi')} 
                className={cn("px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all", language === 'vi' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                VI
              </button>
              <button 
                onClick={() => setLanguage('es')} 
                className={cn("px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all", language === 'es' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                ES
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            
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
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Zap className="w-3 h-3 fill-current" />
              {t('heroBadge')}
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {t('heroTitle')}
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/tests">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] font-black shadow-xl transition-all hover:scale-[1.02]">
                  {t('browseTests')}
                </Button>
              </Link>
              <Link href="/quiz?id=demo-full">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full bg-white border-2 border-slate-200 text-slate-900 font-black transition-all hover:bg-slate-50">
                  {t('tryDemo')}
                </Button>
              </Link>
            </div>

            <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
              {[t('stat1'), t('stat2'), t('stat3')].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="h-1 w-8 bg-[#2563EB] rounded-full opacity-20" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-32 border-y border-slate-200 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#2563EB]">{t('builtForLearning')}</h3>
              <h4 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{t('featureSectionTitle')}</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: t('feature1Title'), desc: t('feature1Desc'), icon: Target, color: "bg-blue-500" },
                { title: t('feature2Title'), desc: t('feature2Desc'), icon: ImageIcon, color: "bg-emerald-500" },
                { title: t('feature3Title'), desc: t('feature3Desc'), icon: ListOrdered, color: "bg-orange-500" },
                { title: t('feature4Title'), desc: t('feature4Desc'), icon: BarChart3, color: "bg-purple-500" }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-[2.5rem] bg-[#F4F5F7] hover:bg-white border-2 border-transparent hover:border-slate-100 transition-all duration-500 hover:shadow-2xl">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110", feature.color)}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h5>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 px-6 bg-[#F4F5F7]">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-black text-slate-900 text-center uppercase tracking-tight mb-20">{t('howItWorksTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block" />
              {[
                { step: "1", title: t('step1'), desc: t('step1Desc') },
                { step: "2", title: t('step2'), desc: t('step2Desc') },
                { step: "3", title: t('step3'), desc: t('step3Desc') }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xl font-black shadow-xl ring-8 ring-[#F4F5F7]">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">{item.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-[#2563EB] rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-10">
              <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                {t('finalCtaTitle')}
              </h3>
              <p className="text-blue-100 text-lg md:text-xl font-medium max-w-xl mx-auto opacity-80">
                {t('finalCtaDesc')}
              </p>
              <div className="flex justify-center">
                <Link href="/tests">
                  <Button size="lg" className="h-16 px-12 text-lg rounded-full bg-white text-[#2563EB] hover:bg-slate-50 font-black shadow-2xl transition-all hover:scale-105 border-none">
                    {t('openLibrary')}
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Visual Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[80px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[80px] rounded-full" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase flex items-center">
                  DNTRNG<span className="w-2 h-2 rounded-full bg-[#2563EB] ml-1" />
                </h1>
              </Link>
              <p className="text-slate-400 font-medium max-w-sm text-sm leading-relaxed">
                {t('footerDesc')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-20">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{t('platform')}</h4>
                <nav className="flex flex-col gap-4 text-xs font-bold text-slate-400">
                  <Link href="/tests" className="hover:text-[#2563EB] transition-colors">{t('library')}</Link>
                  <Link href="/admin" className="hover:text-[#2563EB] transition-colors">{t('adminConsole')}</Link>
                  <Link href="/setup-guide" className="hover:text-[#2563EB] transition-colors">{t('setupProtocol')}</Link>
                </nav>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{t('resources')}</h4>
                <nav className="flex flex-col gap-4 text-xs font-bold text-slate-400">
                  <Link href="/setup-guide" className="hover:text-[#2563EB] transition-colors">{t('identityGuide')}</Link>
                  <Link href="/admin" className="hover:text-[#2563EB] transition-colors">{t('cloudSync')}</Link>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 gap-8">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
              © {new Date().getFullYear()} DNTRNG PLATFORM • PRECISION ASSESSMENT
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  systemStatus === 'Optimal' ? "bg-emerald-500" :
                  systemStatus === 'Degraded' ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {t('systemStatus')}: {t(systemStatus.toLowerCase())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
