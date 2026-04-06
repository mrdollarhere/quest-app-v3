
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  RotateCcw, 
  ArrowRight,
  User,
  Activity,
  History,
  Target,
  Clock,
  Zap,
  Trophy,
  AlertCircle,
  XCircle,
  FileBadge,
  Download
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Question, UserResponse } from '@/types/quiz';
import { getVerdictData } from '@/lib/quiz-config';
import { useSettings } from '@/context/settings-context';
import { PerformanceGauge } from './PerformanceGauge';
import { BenchmarkingSection } from './BenchmarkingSection';
import { StepAnalytics } from './StepAnalytics';
import { generateCertificatePDF } from '@/lib/certificate-utils';

interface QuizResultsProps {
  title: string;
  testId?: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  responses: UserResponse[];
  userName: string;
  onRestart: () => void;
  startTime?: number;
  endTime?: number;
  testMetadata?: any;
  certificateId?: string;
}

export function QuizResults({
  title,
  testId,
  score,
  totalQuestions,
  questions,
  responses,
  userName,
  onRestart,
  startTime,
  endTime,
  testMetadata,
  certificateId
}: QuizResultsProps) {
  const { settings } = useSettings();
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dntrng_text_size') as 'normal' | 'large' | 'small';
    if (saved && ['normal', 'large', 'small'].includes(saved)) {
      setTextSize(saved);
    }
  }, []);

  const percentage = Math.round((score / (totalQuestions || 1)) * 100);
  const globalThreshold = Number(settings.default_pass_threshold || '70');
  const testThreshold = Number(testMetadata?.passing_threshold || globalThreshold);
  
  const isMastery = percentage >= 80;
  const isPass = percentage >= testThreshold;
  
  const verdict = getVerdictData(percentage);

  const durationMs = (endTime && startTime) ? endTime - startTime : 0;
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const renderVerdictMessage = (msg: string, highlight: string, colorClass: string) => {
    const parts = msg.split(highlight);
    return (
      <>
        {parts[0]}
        <span className={cn("font-black", colorClass)}>{highlight}</span>
        {parts[1]}
      </>
    );
  };

  const handleDownloadCertificate = async () => {
    if (!certificateId) return;
    setIsGenerating(true);
    try {
      await generateCertificatePDF({
        studentName: userName,
        testName: title,
        score,
        total: totalQuestions,
        date: new Date(endTime || Date.now()),
        certificateId,
        platformName: String(settings.platform_name || "DNTRNG")
      });
    } catch (e) {
      console.error("Certificate generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const IconMap = {
    Trophy,
    Zap,
    Target,
    AlertCircle,
    XCircle
  };
  const VerdictIcon = IconMap[verdict.iconName];

  const isBenchmarkingEnabled = String(settings.enable_benchmarking ?? 'true') !== 'false';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 md:px-8 selection:bg-primary selection:text-white pb-32 transition-colors duration-500">
      <div className="w-full max-w-6xl space-y-12 animate-in fade-in duration-700">
        
        {/* Header: Identity Bar */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none mb-1.5">Assessment Operator</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{userName}</h1>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.5em]">{title}</h2>
            <div className="h-1 w-32 bg-primary/20 mx-auto rounded-full" />
          </div>
        </div>

        {/* Main Performance Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Performance Gauge Section */}
          <PerformanceGauge 
            percentage={percentage} 
            score={score} 
            totalQuestions={totalQuestions} 
          />

          {/* Diagnostics & Metrics */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <Card className="flex-1 border-none shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-12 flex flex-col justify-center relative overflow-hidden transition-all duration-500">
              {/* Verdict Module */}
              <div className={cn(
                "p-8 rounded-[2rem] border-l-4 mb-10 transition-all duration-500 shadow-sm",
                verdict.border,
                verdict.bg
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <VerdictIcon className={cn("w-5 h-5", verdict.color)} />
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", verdict.color)}>System Verdict</h4>
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-black text-2xl leading-tight tracking-tight">
                  "{renderVerdictMessage(verdict.message, verdict.highlight, verdict.color)}"
                </p>
              </div>

              {/* Benchmarking Module: Conditional Enforcement */}
              {isBenchmarkingEnabled && (
                <BenchmarkingSection testId={testId} percentage={percentage} enabled={true} />
              )}

              {/* Certificate Download Panel */}
              {certificateId && isPass && (
                <div className="mb-10 p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                    <FileBadge className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h4 className="text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-2">Registry Award</h4>
                      <p className="text-xl font-bold leading-tight">Your certification is ready for high-fidelity extraction.</p>
                    </div>
                    <Button 
                      onClick={handleDownloadCertificate}
                      disabled={isGenerating}
                      className="h-14 rounded-full px-8 bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest gap-3 shadow-xl transition-all hover:scale-[1.02]"
                    >
                      {isGenerating ? <Zap className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
                      {isGenerating ? 'Generating PDF...' : 'Download Certificate'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Button onClick={onRestart} variant="outline" className="h-18 rounded-full font-black border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all py-8">
                  <RotateCcw className="w-5 h-5 mr-3" />
                  Restart Module
                </Button>
                <Link href="/tests" className="w-full">
                  <Button className="w-full h-18 rounded-full font-black shadow-2xl bg-primary hover:scale-[1.02] transition-all text-xs uppercase tracking-widest text-white border-none py-8">
                    Enter Library
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <StatMetric icon={History} label="Attempts" value="01" />
              <StatMetric icon={Target} label="Precision" value={isMastery ? "High" : isPass ? "Med" : "Low"} />
              <StatMetric icon={Clock} label="Session" value={formatDuration(durationMs)} />
              <StatMetric icon={Activity} label="Telemetry" value="Live" />
            </div>
          </div>
        </div>

        {/* Step Analytics Section */}
        <StepAnalytics 
          questions={questions} 
          responses={responses} 
          textSize={textSize} 
        />

        {/* Bottom Navigation */}
        <div className="flex justify-center pt-12">
          <Link href="/">
            <Button variant="ghost" className="rounded-full font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.6em] text-[11px] h-14 px-12 group">
              <Home className="w-5 h-5 mr-4" />
              Terminate Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-8 rounded-[2rem] border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-3 group transition-all hover:shadow-md hover:-translate-y-1">
      <Icon className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="space-y-1">
        <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}
