"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, RotateCcw, ArrowRight, FileBadge } from "lucide-react";
import Link from 'next/link';
import { getVerdictData } from '@/lib/quiz-config';
import { useSettings } from '@/context/settings-context';
import { PerformanceGauge } from './PerformanceGauge';
import { BenchmarkingSection } from './BenchmarkingSection';
import { StepAnalytics } from './StepAnalytics';
import { generateCertificatePDF } from '@/lib/certificate-utils';
import { trackEvent } from '@/lib/tracker';
import confetti from 'canvas-confetti';
import { VerdictDisplay } from './results/VerdictDisplay';

export function QuizResults({ title, testId, score, totalQuestions, questions, responses, serverReviewData, userName, onRestart, startTime, endTime, testMetadata, certificateId }: any) {
  const { settings } = useSettings();
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isGenerating, setIsGenerating] = useState(false);

  const percentage = Math.round((score / (totalQuestions || 1)) * 100);
  const verdict = getVerdictData(percentage);
  const isPass = percentage >= Number(testMetadata?.passing_threshold || settings.default_pass_threshold || 70);

  useEffect(() => {
    if (isPass) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isPass]);

  const handleDownload = async () => {
    if (!certificateId) return;
    setIsGenerating(true);
    await generateCertificatePDF({ studentName: userName, testName: title, score, total: totalQuestions, date: new Date(), certificateId: certificateId, platformName: String(settings.platform_name || "DNTRNG") });
    trackEvent('certificate_download', { test_id: testId, test_name: title, details: { score } });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 md:px-8 pb-32">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-white border shadow-xl">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"><User className="w-7 h-7 text-white" /></div>
            <div className="text-left"><p className="text-[10px] font-black uppercase text-slate-400">Assessment Operator</p><h1 className="text-3xl font-black text-slate-900 uppercase">{userName}</h1></div>
          </div>
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.5em]">{title}</h2>
        </div>

        <Card className="p-8 md:p-10 border-none shadow-2xl rounded-[3rem] bg-white flex flex-col md:flex-row items-center gap-10">
          <PerformanceGauge percentage={percentage} score={score} totalQuestions={totalQuestions} compact={true} />
          <VerdictDisplay verdict={verdict} />
        </Card>

        <BenchmarkingSection testId={testId} percentage={percentage} />

        {certificateId && isPass && (
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6"><FileBadge className="w-12 h-12 text-primary" /><div><h4 className="text-primary font-black uppercase text-[10px]">Credential Issued</h4><p className="text-xl font-bold">Certification ready for download.</p></div></div>
            <Button onClick={handleDownload} disabled={isGenerating} className="h-14 rounded-full px-10 bg-primary font-black uppercase text-xs">
              {isGenerating ? 'Generating...' : 'Download Certificate'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><Button onClick={onRestart} variant="outline" className="h-16 rounded-full font-black uppercase text-xs border-2"><RotateCcw className="mr-3" /> Try Again</Button><Link href="/tests"><Button className="w-full h-16 rounded-full font-black uppercase text-xs bg-primary text-white">Back to Tests <ArrowRight className="ml-3" /></Button></Link></div>

        <StepAnalytics questions={questions} responses={responses} serverReviewData={serverReviewData} textSize={textSize} />
      </div>
    </div>
  );
}
