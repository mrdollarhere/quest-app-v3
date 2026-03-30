
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Home, 
  Zap,
  Trophy,
  ArrowRight,
  User,
  Activity,
  History,
  Target,
  Clock,
  TrendingUp,
  Loader2,
  Sparkles,
  X
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Question, UserResponse } from '@/types/quiz';
import { QuestionRenderer } from './QuestionRenderer';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';
import { API_URL } from '@/lib/api-config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

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
  endTime
}: QuizResultsProps) {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [comparativeLoading, setComparativeLoading] = useState(false);

  const percentage = Math.round((score / (totalQuestions || 1)) * 100);
  
  // Performance Thresholds
  const isMastery = percentage >= 80;
  const isPass = percentage >= 50;
  
  const statusColor = isMastery 
    ? "text-emerald-600" 
    : isPass 
      ? "text-amber-600" 
      : "text-rose-600";

  const ringColor = isMastery 
    ? "stroke-emerald-500" 
    : isPass 
      ? "stroke-amber-500" 
      : "stroke-rose-500";

  useEffect(() => {
    if (!testId || !API_URL) return;
    
    const fetchComparison = async () => {
      setComparativeLoading(true);
      try {
        const res = await fetch(`${API_URL}?action=getResponses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const testResponses = data.filter(r => String(r['Test ID']) === String(testId));
          if (testResponses.length > 0) {
            const currentScorePct = percentage;
            const scores = testResponses.map(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100);
            const lowerScores = scores.filter(s => s < currentScorePct).length;
            const calculatedPercentile = Math.round((lowerScores / scores.length) * 100);
            setPercentile(calculatedPercentile);
          } else {
            setPercentile(100);
          }
        }
      } catch (e) {
        console.error("Comparison fetch failed", e);
      } finally {
        setComparativeLoading(false);
      }
    };

    fetchComparison();
  }, [testId, percentage]);

  const getVerdictData = (pct: number) => {
    if (pct >= 95) return { 
      message: "Elite status verified. Perfect cognitive execution.", 
      highlight: "Elite",
      color: "text-emerald-600",
      border: "border-l-emerald-500",
      bg: "bg-emerald-50",
      icon: <Trophy className="w-5 h-5 text-emerald-600" />
    };
    if (pct >= 80) return { 
      message: "Outstanding performance. High-precision synchronization achieved.", 
      highlight: "Precision",
      color: "text-primary",
      border: "border-l-primary",
      bg: "bg-primary/5",
      icon: <Zap className="w-5 h-5 text-primary" />
    };
    if (pct >= 60) return { 
      message: "Alignment success. Functional mastery established.", 
      highlight: "Mastery",
      color: "text-amber-600",
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      icon: <Target className="w-5 h-5 text-amber-600" />
    };
    if (pct >= 40) return { 
      message: "Optimization recommended. Foundational gaps identified.", 
      highlight: "Optimization",
      color: "text-orange-600",
      border: "border-l-orange-500",
      bg: "bg-orange-50",
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />
    };
    return { 
      message: "Critical realignment required. Baseline protocols not met.", 
      highlight: "Critical",
      color: "text-rose-600",
      border: "border-l-rose-500",
      bg: "bg-rose-50",
      icon: <XCircle className="w-5 h-5 text-rose-600" />
    };
  };

  const verdict = getVerdictData(percentage);

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

  const durationMs = (endTime && startTime) ? endTime - startTime : 0;
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };
  const formattedDuration = formatDuration(durationMs);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 md:px-8 selection:bg-primary selection:text-white pb-32 transition-colors duration-500">
      <div className="w-full max-w-6xl space-y-12 animate-in fade-in duration-700">
        
        {/* Header: Identity Bar */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-white border border-slate-200 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none mb-1.5">Assessment Operator</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{userName}</h1>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.5em]">{title}</h2>
            <div className="h-1 w-32 bg-primary/20 mx-auto rounded-full" />
          </div>
        </div>

        {/* Main Performance Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Animated Radial Gauge */}
          <Card className="lg:col-span-5 border-none shadow-2xl rounded-[3rem] bg-white border-slate-100 overflow-hidden flex flex-col items-center justify-center p-12 relative group transition-all duration-500">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 rounded-full blur-[40px] opacity-10 transition-all duration-1000",
                isMastery ? "bg-emerald-500" : isPass ? "bg-amber-500" : "bg-rose-500"
              )} />
              
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="144"
                  cy="144"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="144"
                  cy="144"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  fill="transparent"
                  className={cn("transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,0,0,0.05)]", ringColor)}
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{percentage}%</span>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Alignment</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-10 w-full border-t border-slate-100 pt-12">
              <div className="text-center group/stat">
                <p className="text-4xl font-black text-emerald-600">{score}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 mt-2 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Correct</span>
                </div>
              </div>
              <div className="text-center border-l border-slate-100 group/stat">
                <p className="text-4xl font-black text-rose-600">{totalQuestions - score}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 mt-2 border border-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600/80">Errors</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Diagnostics & Metrics */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <Card className="flex-1 border-none shadow-2xl rounded-[3rem] bg-white border-slate-100 p-12 flex flex-col justify-center relative overflow-hidden transition-all duration-500">
              {/* Refined System Verdict Card */}
              <div className={cn(
                "p-8 rounded-[2rem] border-l-4 mb-10 transition-all duration-500 shadow-sm",
                verdict.border,
                verdict.bg
              )}>
                <div className="flex items-center gap-3 mb-4">
                  {verdict.icon}
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", verdict.color)}>System Verdict</h4>
                </div>
                <p className="text-slate-900 font-black text-2xl leading-tight tracking-tight">
                  "{renderVerdictMessage(verdict.message, verdict.highlight, verdict.color)}"
                </p>
              </div>

              {/* Enhanced Percentile Comparison */}
              {percentile !== null && !comparativeLoading && (
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Global Benchmarking</p>
                      <p className="text-xl font-bold text-slate-700">System Percentile: <span className="text-primary">{percentile}%</span></p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Mastery</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 border border-white">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentile}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Button onClick={onRestart} variant="outline" className="h-18 rounded-full font-black border-2 border-slate-200 bg-transparent text-slate-600 text-xs uppercase tracking-widest hover:bg-slate-50 transition-all py-8">
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
              <StatMetric icon={Clock} label="Session" value={formattedDuration} />
              <StatMetric icon={Activity} label="Telemetry" value="Live" />
            </div>
          </div>
        </div>

        {/* Step Analytics Section */}
        <div className="space-y-10 pt-16 border-t border-slate-200">
          <div className="flex items-center gap-5 px-4">
            <div className="w-14 h-14 bg-primary/5 rounded-[1.5rem] flex items-center justify-center border border-primary/10">
              <History className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">Step Analytics</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Registry Calibration Audit</p>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {questions.map((q, idx) => {
              const userResp = responses.find(r => r.questionId === q.id)?.answer;
              const isCorrect = calculateScoreForQuestion(q, userResp);
              const hasAnswered = userResp !== undefined && userResp !== null;

              return (
                <AccordionItem 
                  key={q.id} 
                  value={`item-${idx}`}
                  className={cn(
                    "border-none rounded-[2rem] overflow-hidden bg-white border border-slate-100 transition-all hover:bg-slate-50/50 group/acc shadow-sm",
                    isCorrect ? "border-l-[6px] border-l-emerald-500" : (hasAnswered ? "border-l-[6px] border-l-rose-500" : "border-l-[6px] border-l-slate-300")
                  )}
                >
                  <AccordionTrigger className="px-10 py-8 hover:no-underline group">
                    <div className="flex items-center gap-10 text-left w-full">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                        !q.correct_answer ? "bg-slate-100 border-slate-200 text-slate-400" : 
                        (isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white")
                      )}>
                        {!q.correct_answer ? <AlertCircle className="w-6 h-6" /> : (isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Step {idx + 1}</span>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                          )}>
                            {isCorrect ? "Correct Alignment" : "Alignment Gap"}
                          </div>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {q.question_text}
                        </h4>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-10 pb-10 pt-0">
                    <div className="h-px w-full bg-slate-100 mb-8" />
                    <div className="max-w-4xl mx-auto rounded-[2rem] bg-slate-50 p-8 border border-slate-100 shadow-inner">
                      <QuestionRenderer 
                        question={q} 
                        value={userResp} 
                        onChange={() => {}} 
                        reviewMode={true} 
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

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
    <div className="p-8 rounded-[2rem] border bg-white border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group transition-all hover:shadow-md hover:-translate-y-1">
      <Icon className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="space-y-1">
        <p className="text-xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}
