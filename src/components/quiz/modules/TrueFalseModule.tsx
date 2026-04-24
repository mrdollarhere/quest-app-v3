"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

/**
 * True/False Interaction Module
 * 
 * Reuses the circular radio card protocol for boolean verification.
 */
export const TrueFalseModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange} 
      disabled={reviewMode} 
      className="flex flex-col gap-[10px]"
      aria-label="True or false assessment"
    >
       {['True', 'False'].map((o) => {
         const isSelected = value === o;
         const inputId = `tf-${question.id}-${o}`;
         
         return (
           <div key={o} className={cn(
             "flex items-center space-x-4 px-[18px] py-[16px] rounded-[16px] border-2 transition-all cursor-pointer group",
             isSelected 
               ? "bg-[#EFF6FF] border-[#2563EB] shadow-sm" 
               : "bg-white border-slate-100 hover:bg-[#EFF6FF] hover:border-[#2563EB]"
           )} onClick={() => !reviewMode && onChange(o)}>
            <RadioGroupItem 
              value={o} 
              id={inputId} 
              className={cn(
                "h-5 w-5 border-2 pointer-events-none transition-transform group-active:scale-95",
                isSelected ? "bg-[#2563EB] border-[#2563EB] text-white" : "border-slate-300"
              )}
            />
            <Label 
              htmlFor={inputId} 
              className="option-text flex-1 cursor-pointer font-normal text-base text-slate-700 select-none leading-tight"
            >
              {o}
            </Label>
            {reviewMode && o === correctArr[0] && <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />}
          </div>
         );
       })}
    </RadioGroup>
  );
};
