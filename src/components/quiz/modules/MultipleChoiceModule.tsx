"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Checkbox } from "@/components/ui/checkbox";
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

export const MultipleChoiceModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const options = useMemo(() => {
    const rawOptions = parseRegistryArray(question.options);
    return reviewMode ? rawOptions : shuffleArray(rawOptions);
  }, [question.id, question.options, reviewMode]);

  const selected = useMemo(() => parseRegistryArray(value), [value]);
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  const toggle = (opt: string) => {
    if (reviewMode) return;
    const next = selected.includes(opt) 
      ? selected.filter(s => s !== opt) 
      : [...selected, opt];
    onChange(next);
  };

  const isOptionInArray = (opt: string, arr: string[]) => {
    return arr.some(item => String(item).trim().toLowerCase() === String(opt).trim().toLowerCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-[10px]">
        {options.map((option, idx) => {
          const isSelected = isOptionInArray(option, selected);
          const isCorrect = isOptionInArray(option, correctArr);
          const isSelectedCorrectly = isSelected && isCorrect;
          const isSelectedIncorrectly = isSelected && !isCorrect;
          const isMissingAnswer = !isSelected && isCorrect && reviewMode;
          
          const inputId = `q-${question.id}-${idx}`;
          
          return (
            <div 
              key={idx} 
              onClick={() => toggle(option)}
              className={cn(
                "flex items-center space-x-4 px-[18px] py-[16px] rounded-[16px] border-2 transition-all group",
                !reviewMode && "cursor-pointer",
                isSelected && !reviewMode && "bg-blue-50 border-blue-600 shadow-sm",
                !isSelected && !reviewMode && "bg-white border-slate-100 hover:bg-blue-50 hover:border-blue-600",
                reviewMode && isSelectedCorrectly && "bg-emerald-50 border-emerald-500 shadow-sm",
                reviewMode && isSelectedIncorrectly && "bg-rose-50 border-rose-500 shadow-sm",
                reviewMode && isMissingAnswer && "bg-white border-emerald-500 border-dashed",
                reviewMode && !isCorrect && !isSelected && "bg-white border-slate-50 opacity-40"
              )}
            >
              <div className="relative shrink-0">
                <Checkbox 
                  id={inputId} 
                  checked={isSelected} 
                  onCheckedChange={() => toggle(option)}
                  disabled={reviewMode}
                  className={cn(
                    "h-5 w-5 rounded border-2 transition-transform",
                    isSelected && !reviewMode ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300",
                    reviewMode && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "",
                    reviewMode && isSelectedIncorrectly ? "bg-rose-500 border-rose-500 text-white" : ""
                  )}
                  onClick={(e) => e.stopPropagation()} 
                />
                {reviewMode && isCorrect && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[4px]" />
                  </div>
                )}
                {reviewMode && isSelectedIncorrectly && (
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
                  reviewMode && isSelectedIncorrectly && "text-rose-700 font-bold"
                )}
                onClick={(e) => !reviewMode && e.preventDefault()}
              >
                {option}
                {isMissingAnswer && (
                  <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                    <Lightbulb className="w-2.5 h-2.5" /> Correct answer / Đáp án đúng
                  </span>
                )}
              </Label>
              {reviewMode && isCorrect && isSelected && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {reviewMode && isSelectedIncorrectly && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
