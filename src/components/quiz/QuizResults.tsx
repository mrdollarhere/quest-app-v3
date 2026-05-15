"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, RotateCcw, ArrowRight, FileBadge, Clock, Target, Trophy } from "lucide-react";
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
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { BackToTop } from '@/components/BackToTop';

export function QuizResults({ title, testId, score, totalQuestions, questions, responses, serverReviewData, userName, onRestart, startTime, endTime, testMetadata, certificateId, duration }: any) {
  const { settings } = useSettings();
  const { user } = useAuth();
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

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Trophy} label="Precision Score" value={`${percentage}%`} color="blue" />
          <StatCard icon={Clock} label="Time Taken" value={formatDuration(duration || 0)} color="green" />
          <StatCard icon={Target} label="Nodes Cleared" value={`${score}/${totalQuestions}`} color="purple" />
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

        <div className={cn(
          "grid gap-5",
          user ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
        )}>
          <Button onClick={onRestart} variant="outline" className="h-16 rounded-full font-black uppercase text-xs border-2">
            <RotateCcw className="mr-3 w-4 h-4" /> Try Again
          </Button>
          <Link href="/tests">
            <Button className="w-full h-16 rounded-full font-black uppercase text-xs bg-primary text-white border-none">
              Back to Tests <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
          {user && (
            <Link href="/profile">
              <Button variant="secondary" className="w-full h-16 rounded-full font-black uppercase text-xs shadow-sm bg-slate-900 text-white hover:bg-slate-800">
                <User className="mr-3 w-4 h-4" /> Identity Registry
              </Button>
            </Link>
          )}
        </div>

        <StepAnalytics questions={questions} responses={responses} serverReviewData={serverReviewData} textSize={textSize} />
      </div>
      <BackToTop />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-md transition-all">
      <div className={cn("p-4 rounded-2xl border-2 transition-transform group-hover:scale-110", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">{value}</p>
      </div>
    </div>
  );
}
