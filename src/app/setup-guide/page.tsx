"use client";

import React from 'react';
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
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SetupGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Protocol metadata copied to clipboard." });
  };

  const SAMPLE_USERS = `id	name	email	role	password
U001	Admin Operator	admin@dntrng.com	admin	admin123
U002	Standard User	user@dntrng.com	user	pass123`;

  const SAMPLE_TESTS = `id	title	description	category	difficulty	duration	image_url
demo-full	The Ultimate Feature Tour	Experience every single question type.	Product Tour	Beginner	10 mins	https://picsum.photos/seed/mountain1/800/450`;

  const SAMPLE_QUESTIONS = `id	question_text	question_type	options	correct_answer	order_group	image_url	metadata	required
q1	Is DNTRNG built on Next.js?	true_false	True, False	True			TRUE
q2	Rank these setup steps:	ordering		1,2,3	Sheet,Script,Config			TRUE`;

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="py-12 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 -ml-2">
                <ArrowLeft className="w-3 h-3 mr-2" /> Return to Base
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-2xl shadow-xl rotate-3">
                <Zap className="text-primary w-6 h-6 fill-current" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Setup Protocol</h1>
                <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] mt-1">Intelligence Initialization v17.0</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-full font-black uppercase text-xs tracking-widest border-2 h-12 px-6">
               Documentation
             </Button>
             <Link href="/login">
               <Button className="rounded-full font-black uppercase text-xs tracking-widest bg-primary h-12 px-8 shadow-xl shadow-primary/20">
                 Launch Console
               </Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        
        {/* Step 1: Google Sheets */}
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-primary flex items-center justify-center text-2xl font-black shadow-2xl">01</div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Sheet Architecture</h2>
              <p className="text-slate-500 font-medium">Provision your database structure in Google Sheets.</p>
            </div>
          </div>

          <div className="space-y-8">
            <Alert className="bg-primary/5 border-primary/20 rounded-[2rem] p-8">
              <Info className="h-6 w-6 text-primary" />
              <AlertTitle className="text-lg font-black uppercase tracking-tight text-primary mb-2">Protocol Requirement</AlertTitle>
              <AlertDescription className="text-slate-600 font-medium leading-relaxed">
                Create a new Google Sheet. You will need to create at least three core tabs named exactly as shown below. Each tab must have the specific headers provided.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-[1.5rem] h-auto">
                <TabsTrigger value="tests" className="rounded-xl py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Tests (Registry)</TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Users (Identity)</TabsTrigger>
                <TabsTrigger value="responses" className="rounded-xl py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Responses (Logs)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests" className="mt-6 space-y-6">
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-black uppercase">Tab: Tests</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(SAMPLE_TESTS)} className="rounded-full font-bold h-9 border-2">Copy Headers</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-sm text-slate-500 font-medium mb-6">This sheet acts as the master catalog for all assessment modules.</p>
                    <div className="bg-slate-900 p-6 rounded-2xl overflow-hidden relative">
                      <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase tracking-widest">Header Definition</div>
                      <code className="text-green-400 font-mono text-xs block overflow-x-auto whitespace-nowrap pb-2">id, title, description, category, difficulty, duration, image_url</code>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="border-dashed border-2 rounded-3xl p-6 bg-slate-50">
                  <TableIcon className="w-5 h-5 text-slate-400" />
                  <AlertTitle className="font-black text-sm uppercase mb-1">Dynamic Question Tabs</AlertTitle>
                  <AlertDescription className="text-xs text-slate-500 font-medium">
                    For every test added to the <strong>Tests</strong> tab, you must create a new tab named exactly after that test's <code>id</code>. 
                    <br/><br/>
                    <strong>Question Tab Headers:</strong> <code className="bg-white px-2 py-0.5 rounded border font-mono">id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required</code>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-black uppercase">Tab: Users</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(SAMPLE_USERS)} className="rounded-full font-bold h-9 border-2">Copy Template</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-slate-900 p-6 rounded-2xl overflow-hidden">
                      <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase tracking-widest">Header Definition</div>
                      <code className="text-green-400 font-mono text-xs block overflow-x-auto whitespace-nowrap">id, name, email, role, password</code>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responses" className="mt-6">
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b p-8">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-black uppercase">Tab: Responses</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-sm text-slate-500 font-medium mb-6">Leave this sheet blank; the intelligence engine will auto-populate logs upon test completion.</p>
                    <div className="bg-slate-900 p-6 rounded-2xl overflow-hidden">
                      <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase tracking-widest">Required Headers</div>
                      <code className="text-green-400 font-mono text-xs block overflow-x-auto whitespace-nowrap">Timestamp, User Name, User Email, Test ID, Score, Total, Duration (ms), Raw Responses</code>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Step 2: Apps Script */}
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-primary flex items-center justify-center text-2xl font-black shadow-2xl">02</div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Intelligence Bridge</h2>
              <p className="text-slate-500 font-medium">Deploy the Google Apps Script backend.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white group hover:shadow-2xl transition-all">
              <Code2 className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black uppercase mb-4">Code Injection</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Open <strong>Extensions &gt; Apps Script</strong> in your Google Sheet. Delete any existing code and paste the content from the DNTRNG template.
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-full font-black text-[10px] uppercase tracking-widest border-2 h-12"
                onClick={() => {
                   toast({ title: "Template Found", description: "Reference src/app/lib/gas-template.ts" });
                }}
              >
                Access Template
              </Button>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Rocket className="w-24 h-24" />
              </div>
              <Rocket className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black uppercase mb-4">Cloud Deployment</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-300">New Deployment &gt; Web App</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-300">Execute as: Me</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-300">Who has access: Anyone</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                Copy the generated Web App URL for the final integration step.
              </p>
            </Card>
          </div>
        </section>

        {/* Step 3: Frontend Config */}
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-primary flex items-center justify-center text-2xl font-black shadow-2xl">03</div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Handshake</h2>
              <p className="text-slate-500 font-medium">Connect the DNTRNG frontend to your new bridge.</p>
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className="flex-1 p-12 border-b md:border-b-0 md:border-r border-slate-100">
                <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" />
                  Integration Logic
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                  Navigate to <code className="bg-slate-50 px-2 py-0.5 rounded border font-mono">src/lib/api-config.ts</code> and update the <code className="text-primary font-bold">API_URL</code> constant with the Web App URL you generated in Step 2.
                </p>
                <div className="p-6 bg-slate-900 rounded-2xl">
                  <pre className="text-xs text-blue-400 font-mono">
                    export const API_URL = "https://script.google.com/..."
                  </pre>
                </div>
              </div>
              <div className="w-full md:w-80 bg-slate-50 p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Protocol Ready</p>
                    <Link href="/login">
                      <Button className="w-full h-14 rounded-full font-black uppercase tracking-tighter bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        Launch System
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>Admin: admin@dntrng.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <Zap className="w-4 h-4" />
                      <span>Pass: admin123</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ / Troubleshooting */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="relative z-10 grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight">Troubleshooting</h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <h4 className="text-primary font-black uppercase text-xs tracking-widest">Permission Denied</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Ensure your Google Apps Script is deployed as a "Web App" and accessible by "Anyone". If "Anyone" is not selected, the handshake will fail.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-primary font-black uppercase text-xs tracking-widest">Tab Not Found</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    The intelligence engine is case-sensitive. Tab names like "Tests" or "Users" must match the code exactly.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight">Support Nodes</h3>
              <p className="text-slate-400 font-medium mb-8">Need further assistance with your intelligence deployment?</p>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold justify-between px-6">
                  System Documentation <ExternalLink className="w-4 h-4 opacity-40" />
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold justify-between px-6">
                  Community Console <ExternalLink className="w-4 h-4 opacity-40" />
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            © {new Date().getFullYear()} DNTRNG PLATFORM • INITIALIZATION PROTOCOL COMPLETED
          </p>
        </div>
      </footer>
    </div>
  );
}
