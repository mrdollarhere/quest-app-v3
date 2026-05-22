"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Check, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const SingleChoiceModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const options = useMemo(() => {
    const rawOptions = parseRegistryArray(question.options);
    return reviewMode ? rawOptions : shuffleArray(rawOptions);
  }, [question.id, question.options, reviewMode]);

  const correctAnswer = useMemo(() => {
    const arr = parseRegistryArray(question.correct_answer);
    return arr[0] || "";
  }, [question.correct_answer]);

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={value || ""} 
        onValueChange={onChange}
        disabled={reviewMode}
        className="flex flex-col gap-[10px]"
      >
        {options.map((option, idx) => {
          const isSelected = String(value || "").trim().toLowerCase() === String(option).trim().toLowerCase();
          const isCorrect = String(option).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
          const isWrong = isSelected && !isCorrect;
          const isMissed = !isSelected && isCorrect && reviewMode;
          const inputId = `q-${question.id}-${idx}`;
          
          return (
            <div 
              key={idx} 
              onClick={() => !reviewMode && onChange(option)}
              className={cn(
                "flex items-center space-x-4 px-[18px] py-[16px] rounded-[16px] border-2 transition-all group",
                !reviewMode && "cursor-pointer",
                isSelected && !reviewMode && "bg-blue-50 border-blue-600 shadow-sm",
                !isSelected && !reviewMode && "bg-white border-slate-100 hover:bg-blue-50 hover:border-blue-600",
                reviewMode && isSelected && isCorrect && "bg-emerald-50 border-emerald-500 shadow-sm",
                reviewMode && isWrong && "bg-rose-50 border-rose-500 shadow-sm",
                reviewMode && isMissed && "bg-white border-emerald-500 border-dashed",
                reviewMode && !isCorrect && !isSelected && "bg-white border-slate-50 opacity-40"
              )}
            >
              <div className="relative shrink-0">
                <RadioGroupItem 
                  value={option} 
                  id={inputId} 
                  className={cn(
                    "h-5 w-5 border-2 rounded-full pointer-events-none transition-transform",
                    isSelected && !reviewMode ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300",
                    reviewMode && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "",
                    reviewMode && isWrong ? "bg-rose-500 border-rose-500 text-white" : ""
                  )}
                />
                {reviewMode && isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[4px]" />
                  </div>
                )}
                {reviewMode && isWrong && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="w-3 h-3 text-white stroke-[4px]" />
                  </div>
                )}
              </div>
              <Label 
                htmlFor={inputId} 
                className={cn(
                  "option-text flex-1 font-normal text-base select-none leading-snug break-words whitespace-normal",
                  !reviewMode && "cursor-pointer text-slate-700",
                  isSelected && !reviewMode && "text-blue-900 font-bold",
                  reviewMode && isCorrect && "text-emerald-700 font-bold",
                  reviewMode && isWrong && "text-rose-700 font-bold",
                  reviewMode && !isCorrect && !isSelected && "text-slate-400"
                )}
                onClick={(e) => !reviewMode && e.preventDefault()}
              >
                {option}
                {isMissed && (
                  <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                    <Lightbulb className="w-2.5 h-2.5" /> Correct answer / Đáp án đúng
                  </span>
                )}
              </Label>
              {reviewMode && isCorrect && isSelected && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {reviewMode && isWrong && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
