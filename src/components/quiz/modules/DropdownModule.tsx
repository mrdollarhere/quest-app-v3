"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { parseRegistryArray, shuffleArray, compareValues } from '@/lib/quiz-utils';
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
  const isCorrect = reviewMode && compareValues(value, correctArr[0]);
  const isSkipped = reviewMode && (!value || String(value).trim() === "");

  return (
    <div className="space-y-6">
      <div className="relative">
        <Select onValueChange={onChange} value={value} disabled={reviewMode}>
          <SelectTrigger className={cn(
            "option-text h-16 text-base font-normal border-2 rounded-2xl px-6 transition-all",
            !reviewMode && "bg-white border-slate-100",
            reviewMode && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold",
            reviewMode && !isCorrect && !isSkipped && "border-rose-500 bg-rose-50 text-rose-700 font-bold",
            isSkipped && "border-amber-400 bg-amber-50/30"
          )}>
            <SelectValue placeholder={isSkipped ? "No answer / Không trả lời" : "Choose..."} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {options.map((o, i) => <SelectItem key={i} value={o} className="option-text">{o}</SelectItem>)}
          </SelectContent>
        </Select>
        
        {reviewMode && isCorrect && (
          <CheckCircle2 className="absolute -right-3 -top-3 w-8 h-8 text-emerald-500 bg-white rounded-full p-1 shadow-lg z-10" />
        )}
        {reviewMode && !isCorrect && !isSkipped && (
          <AlertCircle className="absolute -right-3 -top-3 w-8 h-8 text-rose-500 bg-white rounded-full p-1 shadow-lg z-10" />
        )}
      </div>
      
      {reviewMode && !isCorrect && (
        <div className={cn(
          "p-6 rounded-[2rem] border-2 border-emerald-500 border-dashed flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2",
          "bg-white"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><Lightbulb className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Correct Answer / Đáp án đúng</p>
              <p className="text-lg font-bold text-emerald-900">{correctArr[0]}</p>
            </div>
          </div>
          {!isSkipped && (
            <div className="sm:border-l sm:pl-6 border-slate-100">
              <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Your Answer / Câu trả lời</p>
              <p className="text-base font-bold text-rose-700">{value}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};