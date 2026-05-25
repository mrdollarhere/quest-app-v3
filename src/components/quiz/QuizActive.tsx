/**
 * QuizActive.tsx
 * 
 * Purpose: Primary interaction terminal for active assessment missions.
 * Refactored v19.6: Extracted header UI and keyboard logic for compliance.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizSidebar } from './QuizSidebar';
import { SubmissionDialog } from './SubmissionDialog';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';
import { QuizHeader } from './QuizHeader';
import { useQuizShortcuts } from '@/hooks/useQuizShortcuts';

interface QuizActiveProps {
  quiz: QuizState;
  quizTitle: string;
  timeLeft: number;
  isWrongInRace: boolean;
  onResponseChange: (val: any) => void;
  onConfirmResponse: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onJump: (idx: number) => void;
  onToggleFlag: (id: string) => void;
}

export function QuizActive({
  quiz, quizTitle, timeLeft, onResponseChange, onConfirmResponse,
  onNext, onPrev, onSubmit, onJump, onToggleFlag
}: QuizActiveProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'small'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('dntrng_text_size') as any;
    if (saved) setTextSize(saved);
    const cb = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', cb);
    return () => document.removeEventListener('fullscreenchange', cb);
  }, []);

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const response = quiz.responses.find(r => r.questionId === currentQuestion?.id);
  const isAnswerConfirmed = !!response?.isConfirmed;
  const isTrainingMode = quiz.mode === 'training';
  const isRaceMode = quiz.mode === 'race';
  const isCorrect = isAnswerConfirmed && isTrainingMode && calculateScoreForQuestion(currentQuestion, response?.answer);

  const activeShortcut = useQuizShortcuts({
    onNext: () => (quiz.currentQuestionIndex === quiz.questions.length - 1) ? setIsConfirmOpen(true) : onNext(),
    onPrev, onToggleSidebar: () => setIsSidebarOpen(true),
    onSetTextSize: (s) => { setTextSize(s); localStorage.setItem('dntrng_text_size', s); },
    isRaceMode, isAnswerConfirmed,
    canNext: !isTrainingMode || isAnswerConfirmed
  });

  const isAnswered = (qid: string) => {
    const r = quiz.responses.find(r => r.questionId === qid)?.answer;
    return r !== undefined && r !== null && (typeof r === 'string' ? r.length > 0 : true);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center">
      <QuizHeader 
        current={quiz.currentQuestionIndex + 1} total={quiz.questions.length} title={quizTitle}
        timeLeft={timeLeft} isRaceMode={isRaceMode} isAnswerConfirmed={!isTrainingMode || isAnswerConfirmed}
        isFullscreen={isFullscreen} textSize={textSize} onPrev={onPrev} onNext={onNext}
        onToggleSidebar={() => setIsSidebarOpen(true)} onToggleFullscreen={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
        onSetTextSize={(s) => { setTextSize(s); localStorage.setItem('dntrng_text_size', s); }}
        onSubmit={() => setIsConfirmOpen(true)} activeShortcut={activeShortcut}
      />

      <main className="flex-1 w-full max-w-5xl py-12 md:py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {isTrainingMode && !isAnswerConfirmed && (
          <div className="mb-8 p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2.5rem] flex items-center justify-between max-w-4xl mx-auto animate-in slide-in-from-top-2">
            <div className="flex items-center gap-6"><div className="bg-white p-3 rounded-2xl shadow-sm"><RotateCcw className="w-6 h-6 text-primary" /></div><div><h4 className="text-lg font-black uppercase">Practice Mode</h4><p className="text-sm font-medium text-slate-500">Select nodes then check accuracy.</p></div></div>
            {isAnswered(currentQuestion.id) && <Button onClick={onConfirmResponse} className="h-14 px-8 rounded-full bg-primary font-black shadow-lg">Check Answer <CheckCircle2 className="w-4 h-4 ml-2" /></Button>}
          </div>
        )}

        {isAnswerConfirmed && isTrainingMode && (
          <div className={cn("mb-8 p-8 rounded-[2.5rem] border-2 shadow-xl flex items-center justify-between gap-6 max-w-4xl mx-auto animate-in zoom-in-95", isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100")}>
            <div className="flex items-center gap-6"><div className={cn("w-16 h-16 rounded-full flex items-center justify-center shadow-lg", isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>{isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}</div><div className="text-left"><h4 className={cn("text-2xl font-black uppercase leading-none", isCorrect ? "text-emerald-700" : "text-rose-700")}>{isCorrect ? "Alignment Correct" : "Alignment Error"}</h4><p className="text-sm font-bold opacity-60">Knowledge Node Synchronized</p></div></div>
            {quiz.currentQuestionIndex < quiz.questions.length - 1 ? <Button onClick={onNext} className={cn("h-14 px-8 rounded-full font-black uppercase text-xs", isCorrect ? "bg-emerald-600" : "bg-rose-600")}>Next <ArrowRight className="ml-2 w-4 h-4" /></Button> : <Button onClick={() => setIsConfirmOpen(true)} className="h-14 px-8 rounded-full font-black uppercase text-xs bg-slate-900 text-white">Final Audit</Button>}
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-[16px] p-8 md:p-12" data-textsize={textSize}>
          {currentQuestion && <QuestionRenderer question={currentQuestion} value={response?.answer} onChange={onResponseChange} reviewMode={isAnswerConfirmed} />}
        </div>
      </main>

      <QuizSidebar quiz={quiz} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} onJump={onJump} isAnswered={isAnswered} />
      <SubmissionDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onSubmit={onSubmit} answeredCount={quiz.questions.filter(q => isAnswered(q.id)).length} totalCount={quiz.questions.length} questions={quiz.questions} isAnswered={isAnswered} onJump={onJump} />
    </div>
  );
}
