
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Copy, 
  FileSpreadsheet, 
  Code2, 
  Rocket, 
  Info, 
  Table as TableIcon, 
  Users, 
  Database, 
  LayoutGrid,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Globe,
  Languages,
  ShieldCheck,
  Cpu,
  Server,
  Cloud,
  Terminal,
  FlaskConical,
  History,
  Settings,
  Github,
  Monitor
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GAS_CODE } from '@/app/lib/gas-template';

type Language = 'en' | 'vi';

export default function SetupGuide() {
  const [lang, setLang] = useState<Language>('en');
  const { toast } = useToast();

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: lang === 'en' ? title : "Đã sao chép", 
      description: lang === 'en' ? "Committed to clipboard." : "Đã lưu vào bộ nhớ tạm." 
    });
  };

  const content = {
    en: {
      title: "Hosting Protocol",
      subtitle: "Self-Host DNTRNG™",
      returnBase: "Exit Laboratory",
      launchConsole: "Open Console",
      step1: {
        num: "01",
        title: "Database Architecture",
        desc: "Provision your storage using Google Sheets™ as the master registry.",
        alertTitle: "Critical Requirement",
        alertDesc: "You must create five core tabs named exactly: Tests, Users, Responses, Activity, Settings.",
        tabTests: "Tests",
        tabUsers: "Users",
        tabResponses: "Logs",
        tabActivity: "System",
        tabSettings: "Settings",
        testsTitle: "Registry Tab: Tests",
        testsHeaders: "id, title, description, category, difficulty, duration, image_url",
        usersTitle: "Registry Tab: Users",
        usersHeaders: "id, name, email, role, password",
        responsesTitle: "Registry Tab: Responses",
        responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses",
        activityTitle: "Registry Tab: Activity",
        activityHeaders: "Timestamp, User Name, User Email, Event, IP Address, Device",
        settingsTitle: "Registry Tab: Settings",
        settingsHeaders: "key, value",
        dynamicTitle: "Module Sheets",
        dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
      },
      step2: {
        num: "02",
        title: "Intelligence Bridge",
        desc: "Deploy the Google Apps Script backend to connect the UI to your Sheet.",
        codeTitle: "GAS Template v17.8",
        codeDesc: "Navigate to Extensions > Apps Script in your sheet and inject the template below.",
        deployTitle: "Cloud Deployment",
        deploy1: "Type: Web App",
        deploy2: "Execute as: Me",
        deploy3: "Access: Anyone",
        deployFooter: "Update src/lib/api-config.ts with the provided URL."
      },
      step3: {
        num: "03",
        title: "Frontend Protocol",
        desc: "Initialize your repository and deploy the interface to the global edge.",
        repoTitle: "1. Repository Initialization",
        repoDesc: "Clone the DNTRNG framework and install dependencies.",
        configTitle: "2. Registry Bridge Config",
        configDesc: "Link your local code to your Google Sheet deployment.",
        deployFinalTitle: "3. Global Edge Deployment",
        deployFinalDesc: "Push your code to production using Vercel or Firebase.",
        ready: "Registry Handshake Complete",
        launch: "Initialize Console"
      }
    },
    vi: {
      title: "Quy Trình Tự Triển Khai",
      subtitle: "Hệ Thống DNTRNG™",
      returnBase: "Thoát Phòng Thí Nghiệm",
      launchConsole: "Mở Bảng Điều Khiển",
      step1: {
        num: "01",
        title: "Kiến Trúc Dữ Liệu",
        desc: "Thiết lập Google Sheets™ làm kho lưu trữ dữ liệu chính.",
        alertTitle: "Yêu Cầu Bắt Buộc",
        alertDesc: "Bạn phải tạo 5 tab chính: Tests, Users, Responses, Activity, Settings (Đúng chính tả).",
        tabTests: "Tests",
        tabUsers: "Users",
        tabResponses: "Kết quả",
        tabActivity: "Hệ thống",
        tabSettings: "Cấu hình",
        testsTitle: "Tab Danh Mục: Tests",
        testsHeaders: "id, title, description, category, difficulty, duration, image_url",
        usersTitle: "Tab Danh Tính: Users",
        usersHeaders: "id, name, email, role, password",
        responsesTitle: "Tab Nhật Ký: Responses",
        responsesHeaders: "Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses",
        activityTitle: "Tab Hoạt Động: Activity",
        activityHeaders: "Timestamp, User Name, User Email, Event, IP Address, Device",
        settingsTitle: "Tab Cấu Hình: Settings",
        settingsHeaders: "key, value",
        dynamicTitle: "Tab Câu Hỏi",
        dynamicHeaders: "id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required"
      },
      step2: {
        num: "02",
        title: "Cầu Nối Đám Mây",
        desc: "Triển khai Google Apps Script để đồng bộ hóa dữ liệu.",
        codeTitle: "Mã Nguồn GAS v17.8",
        codeDesc: "Vào Tiện ích mở rộng > Apps Script và dán mã nguồn từ nút bên dưới.",
        deployTitle: "Triển Khai Web",
        deploy1: "Loại: Ứng dụng Web",
        deploy2: "Thực thi: Tôi (Me)",
        deploy3: "Truy cập: Mọi người (Anyone)",
        deployFooter: "Cập nhật URL vào file src/lib/api-config.ts."
      },
      step3: {
        num: "03",
        title: "Triển Khai Giao Diện",
        desc: "Thiết lập mã nguồn và đưa website của bạn lên internet.",
        repoTitle: "1. Khởi Tạo Mã Nguồn",
        repoDesc: "Tải mã nguồn từ GitHub và cài đặt các thư viện cần thiết.",
        configTitle: "2. Cấu Hình Kết Nối",
        configDesc: "Kết nối giao diện với backend Google Sheets của bạn.",
        deployFinalTitle: "3. Đưa Lên Internet",
        deployFinalDesc: "Sử dụng Vercel hoặc Firebase để chạy website chính thức.",
        ready: "Hệ Thống Sẵn Sàng",
        launch: "Bắt Đầu"
      }
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary selection:text-white pb-32">
      {/* Header */}
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
        
        {/* Step 1 */}
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
              <TabsTrigger value="tests" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-xl">{t.step1.tabTests}</TabsTrigger>
              <TabsTrigger value="users" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-xl">{t.step1.tabUsers}</TabsTrigger>
              <TabsTrigger value="responses" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-xl">{t.step1.tabResponses}</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-xl">{t.step1.tabActivity}</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-2xl py-4 font-black uppercase text-[9px] tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-xl">{t.step1.tabSettings}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests" className="mt-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{t.step1.testsTitle}</CardTitle>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(t.step1.testsHeaders, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{t.step1.testsHeaders}</div>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Users className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{t.step1.usersTitle}</CardTitle>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(t.step1.usersHeaders, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{t.step1.usersHeaders}</div>
              </Card>
            </TabsContent>

            <TabsContent value="responses" className="mt-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Database className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{t.step1.responsesTitle}</CardTitle>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(t.step1.responsesHeaders, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{t.step1.responsesHeaders}</div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <History className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{t.step1.activityTitle}</CardTitle>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(t.step1.activityHeaders, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{t.step1.activityHeaders}</div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Settings className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{t.step1.settingsTitle}</CardTitle>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => copyToClipboard(t.step1.settingsHeaders, "Headers Copied")} className="rounded-full font-black text-xs border-2">Copy Headers</Button>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap shadow-inner border-4 border-slate-800">{t.step1.settingsHeaders}</div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Step 2 */}
        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-primary flex items-center justify-center text-3xl font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">{t.step2.num}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.step2.title}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{t.step2.desc}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <Card className="border-none shadow-2xl rounded-[4rem] p-12 bg-white group hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-700">
              <Terminal className="w-12 h-12 text-primary mb-8" />
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{t.step2.codeTitle}</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">{t.step2.codeDesc}</p>
              <Button 
                variant="outline" 
                className="w-full rounded-full font-black text-[10px] uppercase tracking-[0.25em] border-4 h-16 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all" 
                onClick={() => copyToClipboard(GAS_CODE, "GAS Template Copied")}
              >
                Copy Bridge Logic
              </Button>
            </Card>

            <Card className="border-none shadow-2xl rounded-[4rem] p-12 bg-slate-900 text-white relative overflow-hidden group">
              <Rocket className="w-12 h-12 text-primary mb-8 animate-pulse" />
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

        {/* Step 3 */}
        <section className="space-y-16">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-primary flex items-center justify-center text-3xl font-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">{t.step3.num}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.step3.title}</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">{t.step3.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* 3.1 Clone Repo */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="p-10 flex flex-col md:flex-row gap-10 items-start">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Github className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{t.step3.repoTitle}</h3>
                    <p className="text-slate-500 font-medium mt-2">{t.step3.repoDesc}</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl space-y-3 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execute in Terminal</p>
                    <code className="block text-green-400 text-xs font-mono bg-black/30 p-4 rounded-xl border border-white/5">
                      git clone https://github.com/your-username/dntrng-framework.git<br/>
                      cd dntrng-framework<br/>
                      npm install<br/>
                      npm run dev
                    </code>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3.2 Configuration */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="p-10 flex flex-col md:flex-row gap-10 items-start">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{t.step3.configTitle}</h3>
                    <p className="text-slate-500 font-medium mt-2">{t.step3.configDesc}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      Locate <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">src/lib/api-config.ts</code> and update the <code className="font-black">API_URL</code> constant with the Web App URL obtained in <span className="text-primary font-black">Step 02</span>.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3.3 Deploy */}
            <div className="grid md:grid-cols-2 gap-10">
              <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-slate-900 text-white group hover:scale-[1.02] transition-transform">
                <Cloud className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Vercel Deployment</h3>
                <ul className="space-y-3 text-sm font-medium text-slate-400">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Push code to GitHub</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Import Project in Vercel</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Framework: Next.js (Auto)</li>
                </ul>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-white border-4 border-primary/10 group hover:scale-[1.02] transition-transform">
                <Monitor className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Firebase Hosting</h3>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Enable App Hosting</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Connect GitHub Repo</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-primary" /> Automatic SSR Optimization</li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="pt-10">
            <Card className="border-none shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] rounded-[5rem] overflow-hidden bg-slate-900 text-white p-20 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
              <Zap className="w-16 h-16 text-primary mx-auto mb-10 fill-current" />
              <h3 className="text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter">{t.ready}</h3>
              <Link href="/login">
                <Button className="h-20 px-16 rounded-full bg-primary font-black text-xl shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] hover:scale-110 transition-transform border-none">
                  {t.launch}
                  <ChevronRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}
