"use client";

import React from 'react';
import { Question } from '@/types/quiz';
import { Input } from "@/components/ui/input";
import { parseRegistryArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

/**
 * Short Text Interaction Module
 * 
 * Implements a manual text entry node with strict alignment.
 * Logic: Responses are trimmed before being emitted to the parent state.
 */
export const ShortTextModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = parseRegistryArray(question.correct_answer);

  return (
    <div className="space-y-4">
      <Input 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        onBlur={(e) => onChange(e.target.value.trim())}
        placeholder="Enter your response..." 
        disabled={reviewMode} 
        className="option-text h-16 text-base font-normal border-2 rounded-2xl px-6 focus-visible:ring-primary/20" 
      />
      {reviewMode && (
        <div className="option-text p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 font-bold text-emerald-900 animate-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Correct Registry</span>
          {correctArr[0]}
        </div>
      )}
    </div>
  );
};
