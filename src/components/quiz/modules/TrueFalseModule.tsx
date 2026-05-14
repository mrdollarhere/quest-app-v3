"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const TrueFalseModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  const correctAnswer = correctArr[0];

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={value} 
        onValueChange={onChange} 
        disabled={reviewMode} 
        className="flex flex-col gap-[10px]"
      >
        {['True', 'False'].map((o) => {
          const isSelected = value === o;
          const isCorrect = o === correctAnswer;
          const isWrong = isSelected && !isCorrect;
          const inputId = `tf-${question.id}-${o}`;
          
          return (
            <div 
              key={o} 
              className={cn(
                "flex items-center space-x-4 px-[18px] py-[16px] rounded-[16px] border-2 transition-all group",
                !reviewMode && "cursor-pointer",
                isSelected && !reviewMode && "bg-[#EFF6FF] border-[#2563EB] shadow-sm",
                !isSelected && !reviewMode && "bg-white border-slate-100 hover:bg-[#EFF6FF] hover:border-[#2563EB]",
                reviewMode && isSelected && isCorrect && "bg-emerald-50 border-emerald-500 shadow-sm",
                reviewMode && isSelected && !isCorrect && "bg-rose-50 border-rose-500 shadow-sm",
                reviewMode && !isSelected && isCorrect && "bg-white border-emerald-500 border-dashed",
                reviewMode && !isSelected && !isCorrect && "opacity-40"
              )} 
              onClick={() => !reviewMode && onChange(o)}
            >
              <div className="relative">
                <RadioGroupItem 
                  value={o} 
                  id={inputId} 
                  className={cn(
                    "h-5 w-5 border-2 rounded-full pointer-events-none transition-transform",
                    isSelected && !reviewMode ? "bg-[#2563EB] border-[#2563EB] text-white" : "border-slate-300",
                    reviewMode && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "",
                    reviewMode && isWrong ? "bg-rose-500 border-rose-500 text-white" : ""
                  )}
                />
                {reviewMode && isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3px]" />
                  </div>
                )}
                {reviewMode && isWrong && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="w-3 h-3 text-white stroke-[3px]" />
                  </div>
                )}
              </div>
              <Label 
                htmlFor={inputId} 
                className={cn(
                  "option-text flex-1 font-normal text-base select-none leading-tight",
                  !reviewMode && "cursor-pointer text-slate-700",
                  reviewMode && isCorrect && "text-emerald-700 font-bold",
                  reviewMode && isWrong && "text-rose-700 font-bold",
                  reviewMode && !isCorrect && !isSelected && "text-slate-400"
                )}
              >
                {o}
              </Label>
              {reviewMode && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>
      
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            Correct Registry: <span className="font-bold lowercase tracking-normal">{correctAnswer}</span>
          </p>
        </div>
      )}
    </div>
  );
};
