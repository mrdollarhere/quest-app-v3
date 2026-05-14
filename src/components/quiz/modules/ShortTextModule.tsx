"use client";

import React from 'react';
import { Question } from '@/types/quiz';
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { parseRegistryArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const ShortTextModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = parseRegistryArray(question.correct_answer);

  return (
    <div className="space-y-6">
      <Input 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        onBlur={(e) => onChange(e.target.value.trim())}
        placeholder="Enter your response..." 
        disabled={reviewMode} 
        className="option-text h-16 text-base font-normal border-2 rounded-2xl px-6 focus-visible:ring-primary/20" 
      />
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-1 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Correct Registry</p>
            <p className="text-base font-bold text-emerald-900">{correctArr[0]}</p>
          </div>
        </div>
      )}
    </div>
  );
};
