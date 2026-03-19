
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, FileSpreadsheet, Code2, Rocket, Info, Table as TableIcon, Users, History, Database } from "lucide-react";
import { GAS_CODE } from '@/app/lib/gas-template';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SetupGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Data copied to clipboard.",
    });
  };

  const SAMPLE_USERS = `id\tname\temail\trole\tpassword
U001\tAdmin User\tadmin@example.com\tadmin\tadmin123
U002\tJane Smith\tuser@example.com\tuser\tpass123
U003\tJohn Doe\tjohn@example.com\tuser\tjohn123`;

  const SAMPLE_QUESTIONS = `test_id\tid\tquestion_text\tquestion_type\toptions\tcorrect_answer\torder_group\timage_url\tmetadata\trequired
demo-1\tq1\tWhat is QuestFlow?\tsingle_choice\tA Tool,A Framework,A Platform,All of the above\tAll of the above\t\t\tTRUE
demo-1\tq2\tArrange the steps to set up QuestFlow:\tordering\t\tCreate Sheet, Deploy Script, Connect URL\tCreate Sheet, Deploy Script, Connect URL\t\t\tTRUE
demo-logic\tm1\tMatch the technology to its role:\tmatching\t\tReact|Frontend, Sheets|Backend, Apps Script|API\tReact|Frontend, Sheets|Backend, Apps Script|API\t\t\tTRUE
demo-1\th1\tLocate the peak in the image:\thotspot\t\t\t\thttps://picsum.photos/seed/mountain/800/450\t[{"id":"peak","label":"Peak","x":50,"y":35,"radius":10}]\tFALSE`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">QuestFlow Setup</h1>
            <p className="text-sm text-muted-foreground font-medium">Sheet-to-App Integration Guide</p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">1</div>
            <h2 className="text-2xl font-black text-slate-800">Prepare Your Google Sheet</h2>
          </div>
          
          <p className="text-muted-foreground font-medium">
            Create three tabs named exactly as shown below. You can copy the sample data provided to test the system immediately.
          </p>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-3 bg-white border p-1 rounded-xl">
              <TabsTrigger value="users" className="rounded-lg font-bold">1. Users (Auth)</TabsTrigger>
              <TabsTrigger value="questions" className="rounded-lg font-bold">2. Questions</TabsTrigger>
              <TabsTrigger value="responses" className="rounded-lg font-bold">3. Responses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Tab: Users
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(SAMPLE_USERS)} className="rounded-full h-8 text-xs font-bold">
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Sample Data
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-4">Paste this into cell <strong>A1</strong> of your Users tab (Headers: id, name, email, role, password):</p>
                  <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto font-mono text-[10px] text-green-400">
                    {SAMPLE_USERS}
                  </pre>
                  <Alert className="mt-4 bg-amber-50 border-amber-100 text-amber-800">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Users with role <strong>admin</strong> can access the dashboard. The system now checks for <strong>password</strong> matches.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-primary" />
                    Tab: Questions
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(SAMPLE_QUESTIONS)} className="rounded-full h-8 text-xs font-bold">
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Sample Data
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-4">Paste this into cell <strong>A1</strong> of your Questions tab:</p>
                  <pre className="bg-slate-900 p-4 rounded-xl overflow-x-auto font-mono text-[10px] text-green-400 whitespace-pre">
                    {SAMPLE_QUESTIONS}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responses">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Tab: Responses
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">No data entry needed here. The script will automatically create these headers on the first submission:</p>
                  <div className="mt-4 bg-slate-900 p-4 rounded-xl font-mono text-xs text-green-400">
                    Timestamp, Test ID, Score, Total, Duration (ms), Raw Responses
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">2</div>
            <h2 className="text-2xl font-black text-slate-800">Finalize Connection</h2>
          </div>
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    Apps Script Setup
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600 font-medium">
                    <li className="flex gap-2"><span>1.</span> Copy code from <code className="bg-slate-100 px-1">docs/backend.gs</code></li>
                    <li className="flex gap-2"><span>2.</span> In Sheet: <strong>Extensions &gt; Apps Script</strong></li>
                    <li className="flex gap-2"><span>3.</span> Replace spreadsheet ID in code</li>
                    <li className="flex gap-2"><span>4.</span> Deploy as Web App (Me / Anyone)</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Login Instructions
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">
                    Use <strong>admin@example.com</strong> and password <strong>admin123</strong> to test the admin dashboard after setup.
                  </p>
                  <Link href="/login">
                    <Button className="w-full rounded-full font-bold shadow-lg">Go to Login Page</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="text-center pt-8 border-t">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 text-green-700 text-xs font-black uppercase tracking-widest mb-4">
            <Database className="w-3 h-3" />
            Everything is powered by your sheet
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© {new Date().getFullYear()} QuestFlow Engine</p>
        </div>
      </div>
    </div>
  );
}
