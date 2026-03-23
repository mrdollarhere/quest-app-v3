
"use client";

import React, { useState, useEffect } from 'react';
import { QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  ListOrdered,
  RotateCcw,
  Flag,
  Save,
  Type,
  AlertTriangle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizActiveProps {
  quiz: QuizState;
  quizTitle: string;
  timeLeft: number;
  isWrongInRace: boolean;
  onResponseChange: (val: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onJump: (idx: number) => void;
}

export function QuizActive({
  quiz,
  quizTitle,
  timeLeft,
  isWrongInRace,
  onResponseChange,
  onNext,
  onPrev,
  onSubmit,
  onJump
}: QuizActiveProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const progress = quiz.questions.length > 0 ? ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const currentResponse = quiz.responses.find(r => r.questionId === currentQuestion?.id)?.answer;

  const isAnswered = (questionId: string) => {
    const resp = quiz.responses.find(r => r.questionId === questionId)?.answer;
    if (resp === undefined || resp === null) return false;
    if (typeof resp === 'string') return resp.trim().length > 0;
    if (Array.isArray(resp)) return resp.length > 0;
    if (typeof resp === 'object') return Object.keys(resp).length > 0;
    return true;
  };

  const answeredCount = quiz.questions.filter(q => isAnswered(q.id)).length;
  const totalCount = quiz.questions.length;
  const unansweredCount = totalCount - answeredCount;

  const handleCommitAttempt = () => {
    if (unansweredCount > 0) {
      setIsConfirmOpen(true);
    } else {
      onSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular timer calculation
  const totalSessionTime = 900; // Assuming 15m as base for visual progress
  const dashArray = 2 * Math.PI * 18;
  const dashOffset = dashArray - (dashArray * (timeLeft / totalSessionTime));

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Precision Header */}
      <header className="w-full bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2 md:gap-6">
            <Button 
              variant="ghost" 
              onClick={onPrev}
              disabled={quiz.currentQuestionIndex === 0 || quiz.mode === 'race'}
              className="rounded-xl h-12 px-2 md:px-4 text-slate-400 font-bold hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Trước</span>
            </Button>

            <Button 
              variant="secondary" 
              onClick={() => onResponseChange(null)}
              className="bg-[#E8EEF5] text-primary font-bold h-12 rounded-xl px-4 gap-2 border-none hidden md:flex"
            >
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>

            <div className="h-6 w-px bg-slate-100 hidden md:block" />

            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
              <span className="text-sm md:text-base font-black text-primary">
                {quiz.currentQuestionIndex + 1}/{quiz.questions.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                (ID: {currentQuestion?.id})
              </span>
            </div>
          </div>

          {/* Center/Right Utilities */}
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-1 md:gap-4 text-slate-400">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><Save className="w-5 h-5" /></Button>
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ListOrdered className="w-5 h-5" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[450px] rounded-l-[3rem]">
                  <SheetHeader className="mb-10 pt-10 px-4">
                    <SheetTitle className="text-3xl font-black tracking-tighter uppercase">Protocol Flow</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-4 gap-4 px-4">
                    {quiz.questions.map((q, idx) => (
                      <Button
                        key={q.id}
                        variant={quiz.currentQuestionIndex === idx ? "default" : "outline"}
                        className={cn(
                          "h-16 rounded-2xl font-black text-lg transition-all",
                          isAnswered(q.id) && quiz.currentQuestionIndex !== idx && "bg-primary/5 text-primary border-primary/20"
                        )}
                        onClick={() => { onJump(idx); setIsSidebarOpen(false); }}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hidden sm:flex"><Type className="w-5 h-5" /></Button>
            </div>

            {/* Circular Timer */}
            <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className={cn("text-primary transition-all duration-1000", timeLeft < 60 && "text-destructive")}
                />
              </svg>
              <span className={cn(
                "absolute text-[10px] font-black tracking-tighter",
                timeLeft < 60 ? "text-destructive" : "text-slate-900"
              )}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-100 hidden md:block" />

            <Button 
              variant="ghost" 
              className="rounded-xl h-12 gap-2 text-slate-500 font-bold bg-[#F1F5F9] border-none hidden lg:flex"
            >
              <Flag className="w-4 h-4" />
              Mark for Later
            </Button>

            {quiz.currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                onClick={handleCommitAttempt}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105"
              >
                COMMIT
              </Button>
            ) : (
              <Button 
                onClick={onNext}
                className="bg-[#366DC7] hover:bg-[#2D5AB0] text-white rounded-xl h-12 px-4 md:px-8 font-black gap-3 transition-all"
              >
                Tiếp
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        {/* Dynamic Progress Rail */}
        <div className="w-full h-1.5 bg-slate-100 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Assessment Workspace */}
      <main className="flex-1 w-full max-w-5xl py-12 md:py-24 px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {quiz.mode === 'training' && (
          <div className="mb-12 p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2.5rem] flex items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-sm"><RotateCcw className="w-6 h-6 text-primary" /></div>
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Practice Registry Active</h4>
              <p className="text-sm font-medium text-slate-500">Real-time validation is enabled for this session.</p>
            </div>
          </div>
        )}

        {isWrongInRace && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-destructive flex flex-col items-center gap-6 animate-in zoom-in-95">
              <RotateCcw className="w-20 h-20 text-destructive animate-spin-slow" />
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Protocol Terminated</h3>
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Restarting Identity Streak...</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {currentQuestion && (
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentResponse} 
              onChange={onResponseChange}
              reviewMode={quiz.mode === 'training' && isAnswered(currentQuestion.id)}
            />
          )}
        </div>
      </main>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl p-10">
          <AlertDialogHeader>
            <div className="mx-auto w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
            <AlertDialogTitle className="text-3xl font-black text-center uppercase tracking-tight">Gap Analysis</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg font-medium text-slate-500 leading-relaxed">
              You have <span className="text-orange-600 font-black">{unansweredCount} unanswered</span> steps. Commit partial registry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-8">
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase tracking-widest text-xs flex-1">Review</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit} className="h-14 rounded-full bg-slate-900 font-black uppercase tracking-widest text-xs flex-1">Commit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
