/**
 * StudentQuestionView.tsx
 * 
 * Purpose: The active interaction terminal for students during a live question.
 * Used by: src/app/live/[roomCode]/page.tsx
 */

import React from 'react';
import { Clock, CheckCircle2, XCircle, ChevronRight, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { cn } from '@/lib/utils';

interface StudentQuestionViewProps {
  status: 'active' | 'revealed';
  timeLeft: number | null;
  answeredCount: number;
  totalStudents: number;
  result: any;
  studentRank: number | null;
  currentQuestion: any;
  currentAnswer: any;
  stagedAnswer: any;
  isComplexType: boolean;
  isStagedAnswerComplete: boolean;
  hostConnectivityMs: number;
  handleModuleChange: (val: any) => void;
  submitAnswer: (val: any) => void;
}

export function StudentQuestionView({
  status,
  timeLeft,
  answeredCount,
  totalStudents,
  result,
  studentRank,
  currentQuestion,
  currentAnswer,
  stagedAnswer,
  isComplexType,
  isStagedAnswerComplete,
  hostConnectivityMs,
  handleModuleChange,
  submitAnswer
}: StudentQuestionViewProps) {
  const hasTransmitted = currentAnswer !== undefined;
  const isExpired = currentAnswer === "__expired__";
  const isRevealed = status === 'revealed';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {hostConnectivityMs > 30000 && hostConnectivityMs < 60000 && (
        <div className="bg-amber-50 text-white py-2 px-4 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">Host Connection Lost — Waiting to reconnect...</p>
        </div>
      )}

      <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-primary/10 rounded-xl"><Clock className="w-4 h-4 text-primary" /></div>
           <span className={cn("text-2xl font-black tabular-nums", timeLeft === 0 && "text-rose-500")}>
             {isRevealed ? 'REVEALED' : (timeLeft !== null ? `${timeLeft}s` : '---')}
           </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black uppercase text-slate-400">Classroom Progress</span>
          <span className="text-xs font-bold text-primary">{answeredCount} / {totalStudents} Submitted</span>
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-12 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto space-y-8">
          {isRevealed && result && (
             <div className={cn(
               "p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-500",
               result.correct ? "bg-emerald-50" : "bg-rose-50"
             )}>
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
                  {result.correct ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <XCircle className="w-10 h-10 text-rose-500" />}
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{result.correct ? 'Correct Alignment' : 'Alignment Error'}</h2>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{result.correct ? '+100 Intelligence Points' : 'Identity Registry Refused'}</p>
               </div>
               <div className="ml-auto text-right border-l border-white/20 pl-6 hidden sm:block">
                  <p className="text-[9px] font-black uppercase opacity-60">Global Rank</p>
                  <p className="text-2xl font-black">#{studentRank || '--'}</p>
               </div>
             </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100">
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentAnswer !== undefined ? (isExpired ? null : currentAnswer) : stagedAnswer} 
              onChange={handleModuleChange} 
              reviewMode={isRevealed} 
            />
            
            {status === 'active' && currentAnswer === undefined && isComplexType && (
              <div className="mt-10 flex justify-center animate-in slide-in-from-bottom-2 duration-500">
                <Button 
                  onClick={() => submitAnswer(stagedAnswer)} 
                  disabled={!isStagedAnswerComplete}
                  className="h-16 px-12 rounded-full bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all border-none"
                >
                  Confirm Registry <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {hasTransmitted && !isRevealed && (
              <div className={cn(
                "mt-10 p-8 rounded-3xl border-2 border-dashed text-center animate-in zoom-in-95",
                isExpired ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200"
              )}>
                <p className={cn("text-lg font-black uppercase tracking-tight", isExpired ? "text-rose-600" : "text-blue-600")}>
                  {isExpired ? 'Time Expired — Data Transmitted' : 'Registry Transmitted'}
                </p>
                <p className={cn("text-sm font-medium mt-1", isExpired ? "text-rose-400" : "text-blue-400")}>
                  Waiting for host to synchronize reveal...
                </p>
              </div>
            )}
            
            {isRevealed && (
              <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Waiting for mission question advancement...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
