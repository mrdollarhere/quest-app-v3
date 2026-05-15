/**
 * HostQuestionView.tsx
 * 
 * Purpose: Displays the current active question and progress to the teacher.
 */

import React from 'react';
import { ListChecks, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';

interface HostQuestionViewProps {
  currentIdx: number;
  totalQuestions: number;
  answeredCount: number;
  studentCount: number;
  question: any;
  status: 'active' | 'revealed';
  onReveal: () => void;
  onNext: () => void;
}

export function HostQuestionView({
  currentIdx,
  totalQuestions,
  answeredCount,
  studentCount,
  question,
  status,
  onReveal,
  onNext
}: HostQuestionViewProps) {
  return (
    <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><ListChecks className="w-6 h-6 text-primary" /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Question {currentIdx + 1} of {totalQuestions}</p>
            <h3 className="text-2xl font-black uppercase tracking-tight">Intelligence Transmission</h3>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[10px] font-black uppercase text-slate-500">Live Progression</p>
             <p className="text-xl font-black text-primary tabular-nums">{answeredCount} / {studentCount}</p>
           </div>
           <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
             <Clock className="w-6 h-6 text-primary" />
           </div>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] p-10 text-slate-900 shadow-2xl">
        <QuestionRenderer 
          question={question} 
          value={null} 
          onChange={() => {}} 
          reviewMode={status === 'revealed'} 
        />
      </div>
      <div className="flex justify-center gap-6 pt-4">
        {status === 'active' ? (
          <Button 
            onClick={onReveal} 
            disabled={answeredCount === 0} 
            className="h-16 px-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg uppercase shadow-xl transition-all hover:scale-[1.02] border-none"
          >
            <CheckCircle2 className="w-5 h-5 mr-3" /> Reveal Answer
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-lg uppercase shadow-xl transition-all hover:scale-[1.02] border-none"
          >
            {currentIdx === totalQuestions - 1 ? 'Finalize Mission' : 'Advance Next'} <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
