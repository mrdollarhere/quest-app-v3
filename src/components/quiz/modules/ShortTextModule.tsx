"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Lightbulb, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, compareValues } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const ShortTextModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  const isCorrect = reviewMode && compareValues(value, correctArr[0]);
  const isSkipped = reviewMode && (!value || String(value).trim() === "");

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          onBlur={(e) => onChange(e.target.value.trim())}
          placeholder={reviewMode && isSkipped ? "No answer submitted / Không trả lời" : "Enter your response..."} 
          disabled={reviewMode} 
          className={cn(
            "option-text h-16 text-base font-normal border-2 rounded-2xl px-6 transition-all",
            !reviewMode && "bg-white border-slate-100",
            reviewMode && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold",
            reviewMode && !isCorrect && !isSkipped && "border-rose-500 bg-rose-50 text-rose-700 font-bold",
            isSkipped && "border-amber-400 bg-amber-50/30"
          )} 
        />
        {reviewMode && isCorrect && (
          <CheckCircle2 className="absolute -right-3 -top-3 w-8 h-8 text-emerald-500 bg-white rounded-full p-1 shadow-lg z-10" />
        )}
        {reviewMode && !isCorrect && !isSkipped && (
          <AlertCircle className="absolute -right-3 -top-3 w-8 h-8 text-rose-500 bg-white rounded-full p-1 shadow-lg z-10" />
        )}
      </div>

      {reviewMode && !isCorrect && (
        <div className="p-6 rounded-[2rem] border-2 border-emerald-500 border-dashed bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><Lightbulb className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Correct Registry / Đáp án đúng</p>
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