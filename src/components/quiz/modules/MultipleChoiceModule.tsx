"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Check, X } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-[10px]">
        {options.map((option, idx) => {
          const isSelected = selected.includes(option);
          const isCorrect = correctArr.includes(option);
          const isSelectedCorrectly = isSelected && isCorrect;
          const isSelectedIncorrectly = isSelected && !isCorrect;
          const isMissingAnswer = !isSelected && isCorrect;
          
          const inputId = `q-${question.id}-${idx}`;
          
          return (
            <div 
              key={idx} 
              onClick={() => toggle(option)}
              className={cn(
                "flex items-center space-x-4 px-[18px] py-[16px] rounded-[16px] border-2 transition-all group",
                !reviewMode && "cursor-pointer",
                isSelected && !reviewMode && "bg-[#EFF6FF] border-[#2563EB] shadow-sm",
                !isSelected && !reviewMode && "bg-white border-slate-100 hover:bg-[#EFF6FF] hover:border-[#2563EB]",
                reviewMode && isSelectedCorrectly && "bg-emerald-50 border-emerald-500 shadow-sm",
                reviewMode && isSelectedIncorrectly && "bg-rose-50 border-rose-500 shadow-sm",
                reviewMode && isMissingAnswer && "bg-emerald-50/20 border-emerald-300 border-dashed",
                reviewMode && !isCorrect && !isSelected && "bg-white border-slate-50 opacity-40"
              )}
            >
              <div className="relative">
                <Checkbox 
                  id={inputId} 
                  checked={isSelected} 
                  onCheckedChange={() => toggle(option)}
                  disabled={reviewMode}
                  className={cn(
                    "h-5 w-5 rounded border-2 transition-transform",
                    isSelected && !reviewMode ? "bg-[#2563EB] border-[#2563EB] text-white" : "border-slate-300",
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
                  "option-text flex-1 font-normal text-base select-none leading-tight",
                  !reviewMode && "cursor-pointer text-slate-700",
                  reviewMode && isCorrect && "text-emerald-700 font-bold",
                  reviewMode && isSelectedIncorrectly && "text-rose-700 font-bold"
                )}
                onClick={(e) => !reviewMode && e.preventDefault()}
              >
                {option}
              </Label>
              {reviewMode && isCorrect && (
                <CheckCircle2 className={cn("w-5 h-5", isSelected ? "text-emerald-600" : "text-emerald-400 opacity-50")} />
              )}
              {reviewMode && isSelectedIncorrectly && (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
          );
        })}
      </div>
      
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            Correct Nodes: <span className="font-bold lowercase tracking-normal">{correctArr.join(", ")}</span>
          </p>
        </div>
      )}
    </div>
  );
};
