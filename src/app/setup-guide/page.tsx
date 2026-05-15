"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
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
  Code2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GAS_CODE } from '@/lib/gas/latest';
import { SETUP_GUIDE_CONTENT } from '@/app/lib/setup-guide-content';
import { SiteFooter } from '@/components/SiteFooter';

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
    <div className="min-h-screen bg-slate-50 selection:bg-primary selection:text-white flex flex-col">
      <header className="py-12 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full font-bold text-xs text-slate-400 -ml-2 hover:bg-slate-50 transition-all">
                <ArrowLeft className="w-3 h-3 mr-2" /> {t.returnBase}
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
                <FlaskConical className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">{t.title}</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2">{t.subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button onClick={() => setLang('en')} className={cn("px-4 py-2 rounded-full text-[10px] font-black transition-all", lang === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>EN</button>
              <button onClick={() => setLang('vi')} className={cn("px-4 py-2 rounded-full text-[10px] font-black transition-all", lang === 'vi' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>VI</button>
            </div>
            <Link href="/login">
               <Button className="rounded-full font-bold text-xs tracking-widest bg-slate-900 h-11 px-6 shadow-lg">
                 {t.launchConsole}
               </Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24 flex-1">
        {/* Step 1 */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center text-xl font-black shadow-lg">{t.step1.num}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.step1.title}</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{t.step1.desc}</p>
            </div>
          </div>

          <Alert className="bg-primary/5 border-primary/10 rounded-3xl p-8">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div className="ml-4">
              <AlertTitle className="text-sm font-black uppercase text-primary mb-2">{t.step1.alertTitle}</AlertTitle>
              <AlertDescription className="text-slate-600 font-medium text-sm leading-relaxed">{t.step1.alertDesc}</AlertDescription>
            </div>
          </Alert>

          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid grid-cols-5 bg-slate-200/50 p-1.5 rounded-2xl h-auto">
              <TabsTrigger value="tests" className="rounded-xl py-3 font-bold text-[9px] uppercase tracking-wider">{t.step1.tabTests}</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl py-3 font-bold text-[9px] uppercase tracking-wider">{t.step1.tabUsers}</TabsTrigger>
              <TabsTrigger value="responses" className="rounded-xl py-3 font-bold text-[9px] uppercase tracking-wider">{t.step1.tabResponses}</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl py-3 font-bold text-[9px] uppercase tracking-wider">{t.step1.tabActivity}</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl py-3 font-bold text-[9px] uppercase tracking-wider">{t.step1.tabSettings}</TabsTrigger>
            </TabsList>
            
            {[
              { val: 'tests', title: t.step1.testsTitle, headers: t.step1.testsHeaders, icon: LayoutGrid },
              { val: 'users', title: t.step1.usersTitle, headers: t.step1.usersHeaders, icon: Users },
              { val: 'responses', title: t.step1.responsesTitle, headers: t.step1.responsesHeaders, icon: Database },
              { val: 'activity', title: t.step1.activityTitle, headers: t.step1.activityHeaders, icon: History },
              { val: 'settings', title: t.step1.settingsTitle, headers: t.step1.settingsHeaders, icon: Settings }
            ].map(tab => (
              <TabsContent key={tab.val} value={tab.val} className="mt-6">
                <Card className="border-none shadow-lg rounded-[2rem] bg-white p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{tab.title}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(tab.headers, "Headers Copied")} className="rounded-full font-bold text-[10px] uppercase border-2">Copy Headers</Button>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl font-mono text-xs text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border border-slate-800">{tab.headers}</div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Step 2 */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center text-xl font-black shadow-lg">{t.step2.num}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.step2.title}</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{t.step2.desc}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg rounded-[2.5rem] p-10 bg-white group hover:shadow-xl transition-all">
              <Terminal className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black uppercase mb-3 tracking-tight">{t.step2.codeTitle}</h3>
              <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">{t.step2.codeDesc}</p>
              <Button variant="outline" className="w-full rounded-full font-black text-[10px] uppercase tracking-widest border-2 h-12" onClick={() => copyToClipboard(GAS_CODE, "Template Copied")}>Copy Backend Code</Button>
            </Card>

            <Card className="border-none shadow-lg rounded-[2.5rem] p-10 bg-slate-900 text-white">
              <Zap className="w-10 h-10 text-primary mb-6 animate-pulse" />
              <h3 className="text-xl font-black uppercase mb-4 tracking-tight">{t.step2.deployTitle}</h3>
              <div className="space-y-4 mb-8 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> {t.step2.deploy1}</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> {t.step2.deploy2}</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> {t.step2.deploy3}</div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.step2.deployFooter}</p>
            </Card>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-12 pb-20">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center text-xl font-black shadow-lg">{t.step3.num}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.step3.title}</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{t.step3.desc}</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { icon: Github, title: t.step3.repoTitle, desc: t.step3.repoDesc, bg: "bg-slate-900", color: "text-primary", code: "git clone <repo-url>\nnpm install\nnpm run dev" },
              { icon: Code2, title: t.step3.configTitle, desc: t.step3.configDesc, bg: "bg-primary", color: "text-white", note: "Set API_URL in .env.local" }
            ].map((step, idx) => (
              <Card key={idx} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white p-8 flex flex-col md:flex-row gap-8">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", step.bg)}>
                  <step.icon className={cn("w-6 h-6", step.color)} />
                </div>
                <div className="flex-1 space-y-4">
                  <div><h3 className="text-lg font-black uppercase tracking-tight">{step.title}</h3><p className="text-slate-500 font-medium text-sm mt-1">{step.desc}</p></div>
                  {step.code && <pre className="bg-slate-900 p-4 rounded-xl text-green-400 text-[10px] font-mono">{step.code}</pre>}
                  {step.note && <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-bold text-slate-700 text-xs">{step.note}</div>}
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-slate-900 text-white p-16 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <Zap className="w-12 h-12 text-primary mx-auto mb-8 fill-current" />
            <h3 className="text-3xl font-black uppercase mb-6 tracking-tight">{t.ready}</h3>
            <Link href="/login">
              <Button className="h-16 px-12 rounded-full bg-primary font-black text-lg shadow-lg hover:scale-105 transition-transform">
                {t.launch} <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
