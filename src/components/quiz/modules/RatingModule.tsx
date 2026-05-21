"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Star, CheckCircle2, Lightbulb, CircleOff } from "lucide-react";
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
  const targetVal = hasTarget ? parseInt(correctArr[0]) : null;
  const isCorrect = reviewMode && (!hasTarget || ratingValue === targetVal);
  const isSkipped = reviewMode && ratingValue === 0;

  return (
    <div className="space-y-6">
      {isSkipped && (
        <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-4 text-amber-700 animate-in slide-in-from-top-2 mb-6">
          <CircleOff className="w-5 h-5" />
          <p className="text-xs font-black uppercase tracking-tight">No rating selected / Chưa có đánh giá</p>
        </div>
      )}

      <div className="flex items-center justify-center space-x-2 py-8">
        {Array.from({ length: max }).map((_, i) => {
          const starNum = i + 1;
          const isSelected = starNum <= ratingValue;
          const isTarget = targetVal !== null && starNum <= targetVal;
          
          let starColor = "text-slate-200";
          let fillStyle = "fill-transparent";

          if (isSelected) {
            fillStyle = "fill-current";
            if (!reviewMode) starColor = "text-primary";
            else starColor = isCorrect ? "text-emerald-500" : "text-rose-500";
          } else if (reviewMode && isTarget) {
            starColor = "text-emerald-500 opacity-20";
            fillStyle = "fill-current";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={reviewMode}
              onClick={() => onChange(starNum.toString())}
              className={cn("p-2 transition-transform hover:scale-125", reviewMode ? 'cursor-default' : 'cursor-pointer')}
            >
              <Star className={cn("w-14 h-14 transition-colors", starColor, fillStyle)} />
            </button>
          );
        })}
      </div>
      
      {reviewMode && hasTarget && !isCorrect && (
        <div className="p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-500 border-dashed flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="p-2 bg-emerald-100 rounded-xl"><Lightbulb className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Target Registry / Mục tiêu</p>
            <p className="text-lg font-bold text-emerald-900">{targetVal} Stars / Sao</p>
          </div>
        </div>
      )}
    </div>
  );
};