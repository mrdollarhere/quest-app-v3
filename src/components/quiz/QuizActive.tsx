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
  LayoutGrid,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizTimer } from './QuizTimer';
import { QuizSidebar } from './QuizSidebar';
import { SubmissionDialog } from './SubmissionDialog';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';

interface QuizActiveProps {
  quiz: QuizState;
  quizTitle: string;
  timeLeft: number;
  elapsedSeconds: number;
  isWrongInRace: boolean;
  onResponseChange: (val: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onJump: (idx: number) => void;
  onToggleFlag: (id: string) => void;
}

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
  elapsedSeconds,
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
  
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dntrng_text_size') as 'normal' | 'large' | 'small';
    if (saved && ['normal', 'large', 'small'].includes(saved)) {
      setTextSize(saved);
    }
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const progress = useMemo(() => quiz.questions.length > 0 ? ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0, [quiz.currentQuestionIndex, quiz.questions.length]);
  const currentResponse = quiz.responses.find(r => r.questionId === currentQuestion?.id)?.answer;
  const isFlagged = quiz.flaggedQuestionIds?.includes(currentQuestion?.id);

  useEffect(() => {
    if (quiz.mode === 'training') {
      const hasAnswered = quiz.responses.some(r => r.questionId === currentQuestion?.id);
      setIsAnswerConfirmed(hasAnswered);
    } else {
      setIsAnswerConfirmed(false);
    }
  }, [quiz.currentQuestionIndex, quiz.mode, currentQuestion?.id]);

  const handleResponse = (val: any) => {
    if (isAnswerConfirmed) return;
    onResponseChange(val);
    
    if (quiz.mode === 'training') {
      setIsAnswerConfirmed(true);
    }
  };

  const handleNextWithFeedback = () => {
    if (quiz.mode === 'training' && !isAnswerConfirmed) return;
    onNext();
  };

  const isAnswered = (questionId: string) => {
    const resp = quiz.responses.find(r => r.questionId === questionId)?.answer;
    if (resp === undefined || resp === null) return false;
    if (typeof resp === 'string') return resp.trim().length > 0;
    if (Array.isArray(resp)) return resp.length > 0;
    if (typeof resp === 'object') return Object.keys(resp).length > 0;
    return true;
  };

  const answeredCount = quiz.questions.filter(q => isAnswered(q.id)).length;
  
  const isTrainingMode = quiz.mode === 'training';
  const isCorrect = isAnswerConfirmed && isTrainingMode && calculateScoreForQuestion(currentQuestion, currentResponse);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center transition-colors duration-300">
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Button 
              variant="ghost" 
              onClick={onPrev} 
              disabled={quiz.currentQuestionIndex === 0 || quiz.mode === 'race' || isAnswerConfirmed} 
              className="rounded-xl h-12 px-2 md:px-4 text-slate-400 font-bold hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Trước</span>
            </Button>
            <div className="h-6 w-px bg-slate-100 hidden md:block" />
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-sm md:text-base font-black text-primary">{quiz.currentQuestionIndex + 1}/{quiz.questions.length}</span>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock className="w-3 h-3" />
                <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-1 md:gap-4 text-slate-400">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="rounded-full h-10 w-10 hover:bg-slate-50"><LayoutGrid className="w-5 h-5" /></Button>
              <div className="hidden sm:flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setTextSize('small'); localStorage.setItem('dntrng_text_size', 'small'); }}
                  className={cn("rounded-full h-10 w-10 hover:bg-slate-50", textSize === 'small' && "text-primary bg-primary/5")}
                >
                  <span className="text-xs font-black">A-</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setTextSize('normal'); localStorage.setItem('dntrng_text_size', 'normal'); }}
                  className={cn("rounded-full h-10 w-10 hover:bg-slate-50", textSize === 'normal' && "text-primary bg-primary/5")}
                >
                  <span className="text-sm font-black">A</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
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
              className={cn("rounded-xl h-12 gap-2 font-bold border-none hidden lg:flex transition-all", isFlagged ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-500 bg-[#F1F5F9] hover:bg-slate-200")}
            >
              <Flag className={cn("w-4 h-4", isFlagged && "fill-current")} /> {isFlagged ? 'Flagged' : 'Mark for Later'}
            </Button>
            {quiz.currentQuestionIndex === quiz.questions.length - 1 && (!isTrainingMode || isAnswerConfirmed) ? (
              <Button onClick={() => setIsConfirmOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 border-none">COMMIT</Button>
            ) : (
              <Button 
                onClick={handleNextWithFeedback} 
                disabled={isTrainingMode && !isAnswerConfirmed}
                className="bg-[#366DC7] hover:bg-[#2D5AB0] text-white rounded-xl h-12 px-4 md:px-8 font-black gap-3 transition-all border-none disabled:opacity-30"
              >
                Tiếp <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <QuizProgressBar progress={progress} />
      </header>

      <main className="flex-1 w-full max-w-5xl py-12 md:py-20 px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {isTrainingMode && !isAnswerConfirmed && (
          <div className="mb-8 p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2.5rem] flex items-center gap-6 max-w-4xl mx-auto animate-in slide-in-from-top-2 duration-500">
            <div className="bg-white p-3 rounded-2xl shadow-sm"><RotateCcw className="w-6 h-6 text-primary" /></div>
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Practice Mode</h4>
              <p className="text-sm font-medium text-slate-500">Immediate feedback is enabled. Your answer will be locked after selection.</p>
            </div>
          </div>
        )}

        {isAnswerConfirmed && isTrainingMode && (
          <div className={cn(
            "mb-8 p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto animate-in zoom-in-95 duration-500",
            isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
          )}>
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg shrink-0",
                isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              )}>
                {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <div className="text-center sm:text-left">
                <h4 className={cn("text-2xl font-black uppercase tracking-tight leading-none mb-1", isCorrect ? "text-emerald-700" : "text-rose-700")}>
                  {isCorrect ? "Alignment Correct" : "Alignment Error"}
                </h4>
                <p className={cn("text-sm font-bold uppercase tracking-widest", isCorrect ? "text-emerald-600/60" : "text-rose-600/60")}>
                  {isCorrect ? "Knowledge Node Synchronized" : "Correct Registry Value Revealed"}
                </p>
              </div>
            </div>
            {quiz.currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button onClick={onNext} className={cn("h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest border-none shadow-lg", isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700")}>
                Next Question <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => setIsConfirmOpen(true)} className="h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest bg-slate-900 text-white border-none shadow-lg">
                View Final Audit
              </Button>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] rounded-[16px] p-8 md:p-12" data-textsize={textSize}>
          {currentQuestion && (
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentResponse} 
              onChange={handleResponse} 
              reviewMode={isAnswerConfirmed} 
            />
          )}
        </div>
      </main>

      <QuizSidebar quiz={quiz} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} onJump={onJump} isAnswered={isAnswered} />
      <SubmissionDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onSubmit={onSubmit} answeredCount={answeredCount} totalCount={quiz.questions.length} />
    </div>
  );
}
