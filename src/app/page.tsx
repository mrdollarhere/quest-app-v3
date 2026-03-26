"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Database, 
  Smartphone, 
  CheckCircle, 
  Zap,
  ArrowRight,
  Globe,
  Cpu,
  Sparkles,
  ShieldCheck,
  Languages
} from "lucide-react";
import { UserNav } from '@/components/UserNav';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from '@/components/ModeToggle';

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation */}
      <header className="py-6 px-6 md:px-12 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 dark:bg-primary p-2.5 rounded-2xl shadow-xl transform hover:rotate-6 transition-all duration-500">
              <Zap className="text-primary dark:text-white w-5 h-5 fill-current" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">DNTRNG</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              <Link href="/tests" className="hover:text-primary transition-colors">{t('library')}</Link>
              <Link href="/setup-guide" className="hover:text-primary transition-colors">{t('setupGuide')}</Link>
            </nav>
            
            <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />
            
            <div className="flex items-center gap-2">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 rounded-full gap-2 border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Languages className="w-3.5 h-3.5 text-primary" />
                    <span className="hidden sm:inline">{language === 'en' ? 'EN' : language === 'vi' ? 'VI' : 'ES'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px] rounded-2xl p-2 shadow-2xl border-none dark:bg-slate-900" align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="font-bold cursor-pointer rounded-xl p-3">English (US)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('vi')} className="font-bold cursor-pointer rounded-xl p-3">Tiếng Việt</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="font-bold cursor-pointer rounded-xl p-3">Español</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-48 md:pb-64">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[140px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 dark:bg-accent/10 blur-[140px] rounded-full" />
          </div>

          <div className="container max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {t('heroBadge')}
            </div>
            
            <h2 className="text-6xl md:text-9xl font-black mb-10 tracking-tighter text-slate-900 dark:text-white leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {t('heroTitleMain')} <br />
              <span className="text-primary italic">{t('heroTitleItalic')}</span>
            </h2>
            
            <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {t('heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/tests">
                <Button size="lg" className="h-20 px-14 text-xl rounded-full shadow-[0_25px_50px_-12px_rgba(var(--primary),0.25)] hover:scale-105 transition-all bg-primary font-black uppercase tracking-tight">
                  {t('enterLibrary')}
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <Link href="/quiz?id=demo-full">
                <Button size="lg" variant="outline" className="h-20 px-14 text-xl rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-tight transition-all">
                  <Play className="w-5 h-5 mr-3 fill-current" />
                  {t('tryDemo')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlight Section */}
        <section className="bg-slate-50/50 dark:bg-slate-900/50 py-40 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-primary mb-6">{t('builtForLearning')}</h3>
                  <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{t('masterSkills')}</h4>
                </div>
                
                <div className="space-y-8">
                  {[
                    { title: t('feature1Title'), desc: t('feature1Desc'), icon: Sparkles },
                    { title: t('feature2Title'), desc: t('feature2Desc'), icon: Cpu },
                    { title: t('feature3Title'), desc: t('feature3Desc'), icon: CheckCircle }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 border border-transparent dark:border-slate-700">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-slate-900 dark:text-white mb-2">{item.title}</h5>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10" />
                <div className="bg-white dark:bg-slate-800 p-4 rounded-[4rem] shadow-2xl border-8 border-slate-100 dark:border-slate-800 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://picsum.photos/seed/dntrng-preview/800/600" 
                    alt="Platform Preview" 
                    className="w-full h-auto rounded-[3rem]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-40 px-6">
          <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-slate-900 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-10">
              <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
                {t('ctaTitle')} <br />
                <span className="text-primary italic">{t('ctaItalic')}</span>
              </h3>
              <p className="text-slate-400 text-xl md:text-2xl font-medium max-w-xl mx-auto">
                {t('ctaDesc')}
              </p>
              <div className="flex justify-center">
                <Link href="/tests">
                  <Button size="lg" className="h-20 px-16 text-xl rounded-full bg-white text-slate-900 hover:bg-slate-100 dark:bg-primary dark:text-white dark:hover:bg-primary/90 font-black uppercase tracking-tight transition-all hover:scale-105 shadow-2xl border-none">
                    {t('openLibrary')}
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] group-hover:bg-primary/30 transition-all duration-1000" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-[120px] group-hover:bg-accent/30 transition-all duration-1000" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-900 dark:bg-primary p-2 rounded-xl">
                  <Zap className="text-primary dark:text-white w-5 h-5 fill-current" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">DNTRNG</h1>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-medium max-w-sm text-lg leading-relaxed">
                {t('footerDesc')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-24">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('platform')}</h4>
                <nav className="flex flex-col gap-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                  <Link href="/tests" className="hover:text-primary transition-colors">{t('testLibrary')}</Link>
                  <Link href="/admin" className="hover:text-primary transition-colors">{t('adminConsole')}</Link>
                  <Link href="/setup-guide" className="hover:text-primary transition-colors">{t('setupProtocol')}</Link>
                </nav>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">{t('resources')}</h4>
                <nav className="flex flex-col gap-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                  <span className="cursor-pointer hover:text-primary transition-colors">{t('identityGuide')}</span>
                  <span className="cursor-pointer hover:text-primary transition-colors">{t('cloudSync')}</span>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-50 dark:border-slate-900 gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">
              © {new Date().getFullYear()} DNTRNG PLATFORM • PRECISION ASSESSMENT
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('systemOptimal')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
