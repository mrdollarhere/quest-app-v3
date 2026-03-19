
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, Check, FileSpreadsheet, Code2, Rocket, Info } from "lucide-react";
import { GAS_CODE } from '@/app/lib/gas-template';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetupGuide() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
  };

  const API_URL = "https://script.google.com/macros/s/AKfycbxD0P_i2bmNpGH3QPJEsq7cGRac-EFtzo25glrQ10GPoARAyg_Vf4DmAqe0WBf6hw1VjQ/exec";

  return (
    <div className="min-h-screen bg-background p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">QuestFlow Setup Guide</h1>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Important Step</AlertTitle>
          <AlertDescription>
            You must add the <code className="font-bold">test_id</code> column to your sheet to match the quiz ID in the URL.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-2xl font-semibold">Prepare Your Google Sheet</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>Create a new Google Sheet and name your first tab <code className="font-bold">Questions</code>.</p>
              <p>Add these exact headers in row 1:</p>
              <div className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-xs md:text-sm whitespace-nowrap">
                test_id, id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required
              </div>
              <div className="text-sm space-y-2">
                <p><strong>test_id:</strong> Matches the ID in the library (e.g., <code className="bg-muted px-1">demo-1</code>)</p>
                <p><strong>question_type:</strong> single_choice, multiple_choice, matching, ordering, hotspot, rating, etc.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-2xl font-semibold">Deploy Google Apps Script</h2>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Backend API Code</CardTitle>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(GAS_CODE)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
                <li>In Google Sheets, go to <strong>Extensions {">"} Apps Script</strong>.</li>
                <li>Paste the copied code into the editor.</li>
                <li>Replace <code className="bg-muted px-1">YOUR_SPREADSHEET_ID_HERE</code> with your sheet ID (found in URL).</li>
                <li>Click <strong>Deploy {">"} New Deployment</strong>.</li>
                <li>Select <strong>Web App</strong>.</li>
                <li>Set Access to <strong>Anyone</strong>.</li>
                <li>Copy the generated <strong>Web App URL</strong>.</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-2xl font-semibold">Connect the Frontend</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">In the <code className="bg-muted px-1">src/app/quiz/page.tsx</code> file, update the <code className="bg-muted px-1">API_URL</code> constant with your Web App URL.</p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                const API_URL = "{API_URL}";
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="text-center pt-8">
          <Link href="/quiz">
            <Button size="lg" className="rounded-full shadow-lg">
              <Rocket className="w-5 h-5 mr-2" />
              Test Your Integration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
