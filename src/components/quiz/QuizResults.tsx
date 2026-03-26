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
  Loader2
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

  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Performance Thresholds
  const isMastery = percentage >= 80;
  const isPass = percentage >= 50;
  
  const statusColor = isMastery 
    ? "text-emerald-500" 
    : isPass 
      ? "text-orange-500" 
      : "text-destructive";

  const bgColor = isMastery 
    ? "bg-emerald-50 dark:bg-emerald-900/10" 
    : isPass 
      ? "bg-orange-50 dark:bg-orange-900/10" 
      : "bg-red-50 dark:bg-red-900/10";

  const borderColor = isMastery 
    ? "border-emerald-100 dark:border-emerald-900/30" 
    : isPass 
      ? "border-orange-100 dark:border-orange-900/30" 
      : "border-red-100 dark:border-red-900/30";

  useEffect(() => {
    if (!testId || !API_URL) return;
    
    const fetchComparison = async () => {
      setComparativeLoading(true);
      try {
        const res = await fetch(`${API_URL}?action=getResponses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter results for this specific test
          const testResponses = data.filter(r => String(r['Test ID']) === String(testId));
          if (testResponses.length > 0) {
            const currentScorePct = percentage;
            const scores = testResponses.map(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100);
            
            // Calculate how many people scored less than the current user
            const lowerScores = scores.filter(s => s < currentScorePct).length;
            const calculatedPercentile = Math.round((lowerScores / scores.length) * 100);
            setPercentile(calculatedPercentile);
          } else {
            // If user is the first, they are technically in the 100th percentile
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

  const getCompliment = (pct: number) => {
    if (pct >= 95) return "Exceptional mastery! Absolute precision detected.";
    if (pct >= 80) return "Outstanding! Peak cognitive synchronization.";
    if (pct >= 70) return "Success! Core requirements fully met.";
    if (pct >= 50) return "Completed. Optimization recommended.";
    return "Alignment incomplete. Re-engagement advised.";
  };

  // Duration Calculation
  const durationMs = (endTime && startTime) ? endTime - startTime : 0;
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };
  const formattedDuration = formatDuration(durationMs);

  // Circular Gauge Calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 md:px-8 selection:bg-primary selection:text-white pb-32 transition-colors duration-300">
      <div className="w-full max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Header: User Identity */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-[2.5rem] bg-slate-900 dark:bg-slate-900 text-white shadow-2xl ring-8 ring-white dark:ring-slate-800">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none mb-1">Operator Identity</p>
              <h1 className="text-3xl font-black tracking-tight uppercase">{userName}</h1>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">{title}</h2>
            <div className="h-1.5 w-24 bg-primary/10 dark:bg-primary/20 rounded-full mx-auto mt-4" />
          </div>
        </div>

        {/* Performance Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Circular Gauge */}
          <Card className="lg:col-span-5 border-none shadow-2xl rounded-[4rem] bg-white dark:bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-12 relative border border-transparent dark:border-slate-800">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50/50 dark:from-slate-800/10 to-transparent pointer-events-none" />
            
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  fill="transparent"
                  className={cn("transition-all duration-1000 ease-out", statusColor)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">{percentage}%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Accuracy</span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 w-full border-t border-slate-50 dark:border-slate-800 pt-10">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{score}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Correct</p>
              </div>
              <div className="text-center border-l dark:border-slate-800">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{totalQuestions - score}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Errors</p>
              </div>
            </div>
          </Card>

          {/* Right: Analysis & Actions */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <Card className="flex-1 border-none shadow-xl rounded-[3.5rem] bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-10 flex flex-col justify-center">
              <div className={cn("p-8 rounded-[2.5rem] border-2 border-dashed mb-8", borderColor, bgColor)}>
                <div className="flex items-center gap-3 mb-4">
                  {isMastery ? <Trophy className="w-5 h-5 text-emerald-600" /> : <Zap className="w-5 h-5 text-primary" />}
                  <h4 className={cn("text-[10px] font-black uppercase tracking-widest", statusColor)}>Diagnostic Output</h4>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-black text-3xl leading-tight tracking-tight">
                  "{getCompliment(percentage)}"
                </p>
              </div>

              {/* Percentile Comparison Box */}
              {percentile !== null && !comparativeLoading && (
                <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] border-2 border-primary/10 dark:border-primary/20 flex items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Global Benchmarking</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-tight">
                      Your score is better than <span className="text-primary font-black">{percentile}%</span> of participants.
                    </p>
                  </div>
                </div>
              )}

              {comparativeLoading && (
                <div className="h-20 flex items-center justify-center mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300 dark:text-slate-600 mr-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Syncing Benchmark Registry...</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={onRestart} variant="outline" className="h-16 rounded-full font-black border-4 border-slate-100 dark:border-slate-800 text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                  <RotateCcw className="w-4 h-4 mr-2 transition-transform group-hover:-rotate-45" />
                  Restart Module
                </Button>
                <Link href="/tests" className="w-full">
                  <Button className="w-full h-16 rounded-full font-black shadow-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 transition-all text-xs uppercase tracking-widest text-white border-none">
                    Enter Library
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatSmall icon={History} label="Attempts" value="01" />
              <StatSmall icon={Target} label="Precision" value={isMastery ? "High" : isPass ? "Med" : "Low"} />
              <StatSmall icon={Clock} label="Time Taken" value={formattedDuration} />
              <StatSmall icon={Activity} label="Efficiency" value="Live" />
            </div>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-8 pt-12">
          <div className="flex items-center justify-between px-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Step Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2">Structural Registry Audit</p>
              </div>
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
                    "border-none rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl border border-transparent dark:border-slate-800",
                    isCorrect ? "ring-4 ring-emerald-50 dark:ring-emerald-900/10" : (hasAnswered ? "ring-4 ring-red-50 dark:ring-red-900/10" : "ring-4 ring-slate-100 dark:ring-slate-800")
                  )}
                >
                  <AccordionTrigger className="px-10 py-10 hover:no-underline group">
                    <div className="flex items-center gap-8 text-left">
                      <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm border-2 transition-transform group-data-[state=open]:rotate-6",
                        !q.correct_answer ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-600" : 
                        (isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400")
                      )}>
                        {!q.correct_answer ? <AlertCircle className="w-7 h-7" /> : (isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-1">Step {idx + 1} Registry</span>
                        <h4 className="font-black text-slate-800 dark:text-slate-200 text-2xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {q.question_text}
                        </h4>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-12 pb-12 pt-0">
                    <div className="h-px w-full bg-slate-50 dark:bg-slate-800 mb-12" />
                    <div className="max-w-4xl mx-auto">
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
        <div className="flex justify-center pt-16">
          <Link href="/">
            <Button variant="ghost" className="rounded-full font-black text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-[0.5em] text-[10px] h-12 px-10">
              <Home className="w-4 h-4 mr-3" />
              Terminate Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2">
      <Icon className="w-4 h-4 text-slate-300 dark:text-slate-700" />
      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">{label}</p>
    </div>
  );
}
