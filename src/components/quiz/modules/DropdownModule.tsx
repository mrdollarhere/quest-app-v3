"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

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

  return (
    <div className="space-y-6">
      <Select onValueChange={onChange} value={value} disabled={reviewMode}>
        <SelectTrigger className="option-text h-16 text-base font-normal border-2 rounded-2xl px-6">
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((o, i) => <SelectItem key={i} value={o} className="option-text">{o}</SelectItem>)}
        </SelectContent>
      </Select>
      
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            Correct Registry: <span className="font-bold lowercase tracking-normal">{correctArr[0]}</span>
          </p>
        </div>
      )}
    </div>
  );
};
