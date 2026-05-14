"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const DropdownModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const options = useMemo(() => {
    const rawOptions = parseRegistryArray(question.options);
    return reviewMode ? rawOptions : shuffleArray(rawOptions);
  }, [question.id, question.options, reviewMode]);

  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  const isCorrect = reviewMode && String(value || "").trim().toLowerCase() === String(correctArr[0] || "").trim().toLowerCase();

  return (
    <div className="space-y-6">
      <Select onValueChange={onChange} value={value} disabled={reviewMode}>
        <SelectTrigger className={cn(
          "option-text h-16 text-base font-normal border-2 rounded-2xl px-6 transition-all",
          reviewMode && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold",
          reviewMode && !isCorrect && value && "border-rose-500 bg-rose-50 text-rose-700 font-bold",
          reviewMode && !value && "border-slate-200 opacity-60"
        )}>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((o, i) => <SelectItem key={i} value={o} className="option-text">{o}</SelectItem>)}
        </SelectContent>
      </Select>
      
      {reviewMode && (
        <div className={cn(
          "p-5 rounded-2xl border-2 flex items-center gap-4 animate-in slide-in-from-top-2",
          isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
        )}>
          {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest", isCorrect ? "text-emerald-700" : "text-rose-700")}>
              Correct Registry
            </p>
            <p className={cn("text-base font-bold", isCorrect ? "text-emerald-900" : "text-rose-900")}>
              {correctArr[0]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
