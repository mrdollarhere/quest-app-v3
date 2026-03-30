"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Table as TableIcon, 
  Users, 
  Database, 
  LayoutGrid,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Terminal,
  FlaskConical,
  History,
  Settings,
  Github,
  Monitor,
  Cloud,
  Code2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GAS_CODE } from '@/app/lib/gas-template';
import { SETUP_GUIDE_CONTENT } from '@/app/lib/setup-guide-content';

type Language = 'en' | 'vi';

export default function SetupGuide() {
  const [lang, setLang] = useState<Language>('en');
  const { toast } = useToast();

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: lang === 'en' ? title : "Đã sao chép", 
      description: lang === 'en' ? "Copied to clipboard." : "Đã lưu vào bộ nhớ tạm." 
    });
  };

  const t = SETUP_GUIDE_CONTENT[lang];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary selection:text-white pb-32">
      <header className="py-16 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 -ml-2 hover:bg-slate-50 transition-all">
                <ArrowLeft className="w-3 h-3 mr-2" /> {t.returnBase}
              </Button>
            </Link>
            <div className="flex items-center gap-6">
              <div className="bg-slate-900 p-4 rounded-[1.5rem] shadow-2xl rotate-3">
                <FlaskConical className="text-primary w-8 h-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">{t.title}</h1>
                <p className="text-sm font-bold text-primary uppercase tracking-[0.3em] mt-3">{t.subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-inner">
              <button onClick={() => setLang('en')} className={cn("px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", lang === 'en' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600")}>EN</button>
              <button onClick={() => setLang('vi')} className={cn("px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", lang === 'vi' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600")}>VI</button>
            </div>
            <Link href="/login">
               <Button className="rounded-full font-black uppercase text-xs tracking-widest bg-slate-900 h-14 px-10 shadow-2xl hover:scale-105 transition-all">
                 {t.launchConsole}
               </Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-24 space-y-32">
        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-primary flex items-center justify-center text-3xl font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">{t.step1.num}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.step1.title}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{t.step1.desc}</p>
            </div>
          </div>

          <Alert className="bg-primary/5 border-primary/20 rounded-[3rem] p-10 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <AlertTitle className="text-xl font-black uppercase text-primary mb-3 tracking-tight">{t.step1.alertTitle}</AlertTitle>
              <AlertDescription className="text-slate-600 font-medium text-base leading-relaxed">{t.step1.alertDesc}</AlertDescription>
            </div>
          </Alert>

          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid grid-cols-5 bg-slate-200/50 p-2 rounded-[2rem] h-auto shadow-inner">
              <TabsTrigger value="tests" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em]">{t.step1.tabTests}</TabsTrigger>
              <TabsTrigger value="users" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em]">{t.step1.tabUsers}</TabsTrigger>
              <TabsTrigger value="responses" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em]">{t.step1.tabResponses}</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em]">{t.step1.tabActivity}</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em]">{t.step1.tabSettings}</TabsTrigger>
            </TabsList>
            
            {[
              { val: 'tests', title: t.step1.testsTitle, headers: t.step1.testsHeaders, icon: LayoutGrid },
              { val: 'users', title: t.step1.usersTitle, headers: t.step1.usersHeaders, icon: Users },
              { val: 'responses', title: t.step1.responsesTitle, headers: t.step1.responsesHeaders, icon: Database },
              { val: 'activity', title: t.step1.activityTitle, headers: t.step1.activityHeaders, icon: History },
              { val: 'settings', title: t.step1.settingsTitle, headers: t.step1.settingsHeaders, icon: Settings }
            ].map(tab => (
              <TabsContent key={tab.val} value={tab.val} className="mt-10">
                <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <tab.icon className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">{tab.title}</CardTitle>
                    </div>
                    <Button variant="outline" size="lg" onClick={() => copyToClipboard(tab.headers, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{tab.headers}</div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-primary flex items-center justify-center text-3xl font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">{t.step2.num}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.step2.title}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{t.step2.desc}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <Card className="border-none shadow-2xl rounded-[4rem] p-12 bg-white group hover:shadow-xl transition-all">
              <Terminal className="w-12 h-12 text-primary mb-8" />
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{t.step2.codeTitle}</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">{t.step2.codeDesc}</p>
              <Button variant="outline" className="w-full rounded-full font-black text-[10px] uppercase tracking-[0.25em] border-4 h-16" onClick={() => copyToClipboard(GAS_CODE, "Template Copied")}>Copy Backend Code</Button>
            </Card>

            <Card className="border-none shadow-2xl rounded-[4rem] p-12 bg-slate-900 text-white">
              <Zap className="w-12 h-12 text-primary mb-8 animate-pulse" />
              <h3 className="text-2xl font-black uppercase mb-6 tracking-tight">{t.step2.deployTitle}</h3>
              <div className="space-y-5 mb-10 text-sm font-bold text-slate-400">
                <div className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-primary" /> {t.step2.deploy1}</div>
                <div className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-primary" /> {t.step2.deploy2}</div>
                <div className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-primary" /> {t.step2.deploy3}</div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{t.step2.deployFooter}</p>
            </Card>
          </div>
        </section>

        <section className="space-y-16">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-primary flex items-center justify-center text-3xl font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">{t.step3.num}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.step3.title}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{t.step3.desc}</p>
            </div>
          </div>

          <div className="space-y-10">
            {[
              { icon: Github, title: t.step3.repoTitle, desc: t.step3.repoDesc, bg: "bg-slate-900", color: "text-primary", code: "git clone <repo-url>\nnpm install\nnpm run dev" },
              { icon: Code2, title: t.step3.configTitle, desc: t.step3.configDesc, bg: "bg-primary", color: "text-white", note: "Update API_URL in src/lib/api-config.ts" }
            ].map((step, idx) => (
              <Card key={idx} className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10 flex flex-col md:flex-row gap-10">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", step.bg)}>
                  <step.icon className={cn("w-8 h-8", step.color)} />
                </div>
                <div className="flex-1 space-y-6">
                  <div><h3 className="text-2xl font-black uppercase tracking-tight">{step.title}</h3><p className="text-slate-500 font-medium mt-2">{step.desc}</p></div>
                  {step.code && <pre className="bg-slate-900 p-6 rounded-2xl text-green-400 text-xs font-mono">{step.code}</pre>}
                  {step.note && <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 font-bold text-slate-700 text-sm">{step.note}</div>}
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-2xl rounded-[5rem] overflow-hidden bg-slate-900 text-white p-20 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <Zap className="w-16 h-16 text-primary mx-auto mb-10 fill-current" />
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter">{t.ready}</h3>
            <Link href="/login">
              <Button className="h-20 px-16 rounded-full bg-primary font-black text-xl shadow-xl hover:scale-110 transition-transform">
                {t.launch} <ChevronRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}
