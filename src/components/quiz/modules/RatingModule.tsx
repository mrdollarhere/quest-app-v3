"use client";

import React from 'react';
import { Question } from '@/types/quiz';
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const RatingModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const ratingValue = parseInt(value || "0");
  const max = 5;
  const correctArr = parseRegistryArray(question.correct_answer);
  const hasTarget = correctArr.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-2 py-8">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={reviewMode}
            onClick={() => onChange((i + 1).toString())}
            className={cn("p-2 transition-transform hover:scale-125", reviewMode ? 'cursor-default' : 'cursor-pointer')}
          >
            <Star 
              className={cn("w-12 h-12 transition-colors", i < ratingValue ? 'fill-accent text-accent' : 'text-slate-200')} 
            />
          </button>
        ))}
      </div>
      
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            {hasTarget ? `Target Registry: ${correctArr[0]} stars` : 'Survey Mode: Any response accepted'}
          </p>
        </div>
      )}
    </div>
  );
};
