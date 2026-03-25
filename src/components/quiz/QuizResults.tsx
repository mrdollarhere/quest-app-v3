
"use client";

import React from 'react';
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
  Target
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Question, UserResponse } from '@/types/quiz';
import { QuestionRenderer } from './QuestionRenderer';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuizResultsProps {
  title: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  responses: UserResponse[];
  userName: string;
  onRestart: () => void;
}

export function QuizResults({
  title,
  score,
  totalQuestions,
  questions,
  responses,
  userName,
  onRestart
}: QuizResultsProps) {
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
    ? "bg-emerald-50" 
    : isPass 
      ? "bg-orange-50" 
      : "bg-red-50";

  const borderColor = isMastery 
    ? "border-emerald-100" 
    : isPass 
      ? "border-orange-100" 
      : "border-red-100";

  const getCompliment = (pct: number) => {
    if (pct >= 95) return "Exceptional mastery! Absolute precision detected.";
    if (pct >= 80) return "Outstanding! Peak cognitive synchronization.";
    if (pct >= 70) return "Success! Core requirements fully met.";
    if (pct >= 50) return "Completed. Optimization recommended.";
    return "Alignment incomplete. Re-engagement advised.";
  };

  // Circular Gauge Calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-12 px-4 md:px-8 selection:bg-primary selection:text-white pb-32">
      <div className="w-full max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Header: User Identity */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl ring-8 ring-white">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none mb-1">Operator Identity</p>
              <h1 className="text-3xl font-black tracking-tight uppercase">{userName}</h1>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.4em]">{title}</h2>
            <div className="h-1.5 w-24 bg-primary/10 rounded-full mx-auto mt-4" />
          </div>
        </div>

        {/* Performance Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Circular Gauge */}
          <Card className="lg:col-span-5 border-none shadow-2xl rounded-[4rem] bg-white overflow-hidden flex flex-col items-center justify-center p-12 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none" />
            
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100"
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
                <span className="text-7xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accuracy</span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 w-full border-t border-slate-50 pt-10">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{score}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Correct</p>
              </div>
              <div className="text-center border-l">
                <p className="text-3xl font-black text-slate-900">{totalQuestions - score}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Errors</p>
              </div>
            </div>
          </Card>

          {/* Right: Analysis & Actions */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <Card className="flex-1 border-none shadow-xl rounded-[3.5rem] bg-white p-10 flex flex-col justify-center">
              <div className={cn("p-8 rounded-[2.5rem] border-2 border-dashed mb-8", borderColor, bgColor)}>
                <div className="flex items-center gap-3 mb-4">
                  {isMastery ? <Trophy className="w-5 h-5 text-emerald-600" /> : <Zap className="w-5 h-5 text-primary" />}
                  <h4 className={cn("text-[10px] font-black uppercase tracking-widest", statusColor)}>Diagnostic Output</h4>
                </div>
                <p className="text-slate-700 font-black text-3xl leading-tight tracking-tight">
                  "{getCompliment(percentage)}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={onRestart} variant="outline" className="h-16 rounded-full font-black border-4 text-xs uppercase tracking-widest hover:bg-slate-50 transition-all group">
                  <RotateCcw className="w-4 h-4 mr-2 transition-transform group-hover:-rotate-45" />
                  Restart Module
                </Button>
                <Link href="/tests">
                  <Button className="w-full h-16 rounded-full font-black shadow-2xl bg-slate-900 hover:bg-slate-800 transition-all text-xs uppercase tracking-widest">
                    Enter Library
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <StatSmall icon={History} label="Attempts" value="01" />
              <StatSmall icon={Target} label="Precision" value={isMastery ? "High" : isPass ? "Med" : "Low"} />
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
                <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">Step Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Structural Registry Audit</p>
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
                    "border-none rounded-[3rem] overflow-hidden bg-white shadow-sm transition-all hover:shadow-xl",
                    isCorrect ? "ring-4 ring-emerald-50" : (hasAnswered ? "ring-4 ring-red-50" : "ring-4 ring-slate-100")
                  )}
                >
                  <AccordionTrigger className="px-10 py-10 hover:no-underline group">
                    <div className="flex items-center gap-8 text-left">
                      <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm border-2 transition-transform group-data-[state=open]:rotate-6",
                        !q.correct_answer ? "bg-slate-50 border-slate-100 text-slate-400" : 
                        (isCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600")
                      )}>
                        {!q.correct_answer ? <AlertCircle className="w-7 h-7" /> : (isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Step {idx + 1} Registry</span>
                        <h4 className="font-black text-slate-800 text-2xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {q.question_text}
                        </h4>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-12 pb-12 pt-0">
                    <div className="h-px w-full bg-slate-50 mb-12" />
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
            <Button variant="ghost" className="rounded-full font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.5em] text-[10px] h-12 px-10">
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
    <div className="p-6 bg-white rounded-[2rem] border shadow-sm flex flex-col items-center text-center gap-2">
      <Icon className="w-4 h-4 text-slate-300" />
      <p className="text-lg font-black text-slate-900 leading-none">{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
