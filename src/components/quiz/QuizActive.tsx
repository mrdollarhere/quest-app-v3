"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Flag,
  Save,
  Type,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizTimer } from './QuizTimer';
import { QuizSidebar } from './QuizSidebar';
import { SubmissionDialog } from './SubmissionDialog';

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
  onToggleFlag: (id: string) => void;
}

// Optimized Progress Bar for performance
const QuizProgressBar = React.memo(({ progress }: { progress: number }) => (
  <div className="w-full h-1.5 bg-slate-100 relative overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
    <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
  </div>
));
QuizProgressBar.displayName = 'QuizProgressBar';

export function QuizActive({
  quiz,
  quizTitle,
  timeLeft,
  isWrongInRace,
  onResponseChange,
  onNext,
  onPrev,
  onSubmit,
  onJump,
  onToggleFlag
}: QuizActiveProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('dntrng_text_size') as 'normal' | 'large' | 'small';
    if (saved && ['normal', 'large', 'small'].includes(saved)) {
      setTextSize(saved);
    }
  }, []);

  const toggleTextSize = () => {
    const modes: ('normal' | 'large' | 'small')[] = ['normal', 'large', 'small'];
    const currentIndex = modes.indexOf(textSize);
    const nextSize = modes[(currentIndex + 1) % modes.length];
    setTextSize(nextSize);
    localStorage.setItem('dntrng_text_size', nextSize);
  };
  
  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const progress = useMemo(() => quiz.questions.length > 0 ? ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0, [quiz.currentQuestionIndex, quiz.questions.length]);
  const currentResponse = quiz.responses.find(r => r.questionId === currentQuestion?.id)?.answer;
  const isFlagged = quiz.flaggedQuestionIds?.includes(currentQuestion?.id);

  const isAnswered = (questionId: string) => {
    const resp = quiz.responses.find(r => r.questionId === questionId)?.answer;
    if (resp === undefined || resp === null) return false;
    if (typeof resp === 'string') return resp.trim().length > 0;
    if (Array.isArray(resp)) return resp.length > 0;
    if (typeof resp === 'object') return Object.keys(resp).length > 0;
    return true;
  };

  const answeredCount = quiz.questions.filter(q => isAnswered(q.id)).length;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center transition-colors duration-300">
      <h1 className="sr-only">{quizTitle} Assessment Terminal</h1>

      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Button 
              variant="ghost" 
              onClick={onPrev} 
              disabled={quiz.currentQuestionIndex === 0 || quiz.mode === 'race'} 
              aria-label="Previous question"
              className="rounded-xl h-12 px-2 md:px-4 text-slate-400 font-bold hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Trước</span>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onResponseChange(null)} 
              aria-label="Reset current answer"
              className="bg-[#E8EEF5] text-primary font-bold h-12 rounded-xl px-4 gap-2 border-none hidden md:flex"
            >
              <RotateCcw className="w-4 h-4" /> Đặt lại
            </Button>
            <div className="h-6 w-px bg-slate-100 hidden md:block" />
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2" role="status" aria-label={`Question ${quiz.currentQuestionIndex + 1} of ${quiz.questions.length}`}>
              <span className="text-sm md:text-base font-black text-primary">{quiz.currentQuestionIndex + 1}/{quiz.questions.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">(ID: {currentQuestion?.id})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-1 md:gap-4 text-slate-400">
              <Button variant="ghost" size="icon" aria-label="Save progress" className="rounded-full h-10 w-10 hover:bg-slate-50"><Save className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" aria-label="Open question navigator" onClick={() => setIsSidebarOpen(true)} className="rounded-full h-10 w-10 hover:bg-slate-50"><LayoutGrid className="w-5 h-5" /></Button>
              <div className="hidden sm:flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label={textSize === 'small' ? "Currently small text size" : "Decrease text size"}
                  aria-pressed={textSize === 'small'}
                  onClick={() => { setTextSize('small'); localStorage.setItem('dntrng_text_size', 'small'); }}
                  className={cn("rounded-full h-10 w-10 hover:bg-slate-50", textSize === 'small' && "text-primary bg-primary/5")}
                >
                  <span className="text-xs font-black">A-</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label={textSize === 'normal' ? "Currently normal text size" : "Reset text size to normal"}
                  aria-pressed={textSize === 'normal'}
                  onClick={() => { setTextSize('normal'); localStorage.setItem('dntrng_text_size', 'normal'); }}
                  className={cn("rounded-full h-10 w-10 hover:bg-slate-50", textSize === 'normal' && "text-primary bg-primary/5")}
                >
                  <span className="text-sm font-black">A</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label={textSize === 'large' ? "Currently large text size" : "Increase text size"}
                  aria-pressed={textSize === 'large'}
                  onClick={() => { setTextSize('large'); localStorage.setItem('dntrng_text_size', 'large'); }}
                  className={cn("rounded-full h-10 w-10 hover:bg-slate-50", textSize === 'large' && "text-primary bg-primary/5")}
                >
                  <span className="text-base font-black">A+</span>
                </Button>
              </div>
            </div>
            <QuizTimer timeLeft={timeLeft} />
            <div className="h-6 w-px bg-slate-100 hidden md:block" />
            <Button 
              variant="ghost" 
              onClick={() => currentQuestion && onToggleFlag(currentQuestion.id)} 
              aria-label="Mark question for later review"
              aria-pressed={isFlagged}
              className={cn("rounded-xl h-12 gap-2 font-bold border-none hidden lg:flex transition-all", isFlagged ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-500 bg-[#F1F5F9] hover:bg-slate-200")}
            >
              <Flag className={cn("w-4 h-4", isFlagged && "fill-current")} /> {isFlagged ? 'Flagged' : 'Mark for Later'}
            </Button>
            {quiz.currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={() => setIsConfirmOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 border-none">COMMIT</Button>
            ) : (
              <Button onClick={onNext} aria-label="Next question" className="bg-[#366DC7] hover:bg-[#2D5AB0] text-white rounded-xl h-12 px-4 md:px-8 font-black gap-3 transition-all border-none">Tiếp <ChevronRight className="w-5 h-5" /></Button>
            )}
          </div>
        </div>
        <QuizProgressBar progress={progress} />
      </header>

      <main className="flex-1 w-full max-w-5xl py-12 md:py-20 px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {quiz.mode === 'training' && (
          <div className="mb-8 p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2.5rem] flex items-center gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-3 rounded-2xl shadow-sm"><RotateCcw className="w-6 h-6 text-primary" /></div>
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Practice Mode</h4>
              <p className="text-sm font-medium text-slate-500">Fixed sequence. Take your time and submit when finished.</p>
            </div>
          </div>
        )}
        {isWrongInRace && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-destructive flex flex-col items-center gap-6 animate-in zoom-in-95">
              <RotateCcw className="w-20 h-20 text-destructive animate-spin-slow" /><h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Protocol Terminated</h3><p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Restarting Identity Streak...</p>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] rounded-[16px] p-8 md:p-12" data-textsize={textSize}>
          {currentQuestion && (
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentResponse} 
              onChange={onResponseChange} 
              reviewMode={false} 
            />
          )}
        </div>
      </main>

      <QuizSidebar quiz={quiz} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} onJump={onJump} isAnswered={isAnswered} />
      <SubmissionDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onSubmit={onSubmit} answeredCount={answeredCount} totalCount={quiz.questions.length} />
    </div>
  );
}
