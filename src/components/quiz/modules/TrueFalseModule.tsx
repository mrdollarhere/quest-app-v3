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

export const TrueFalseModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange} 
      disabled={reviewMode} 
      className="flex flex-col gap-[10px]"
    >
       {['True', 'False'].map((o) => {
         const isSelected = value === o;
         
         return (
           <div key={o} className={cn(
             "flex items-center space-x-3 px-[18px] py-[14px] rounded-[12px] border transition-all cursor-pointer",
             isSelected 
               ? "bg-[#EFF6FF] border-[#2563EB] shadow-sm" 
               : "bg-white border-[#E5E7EB] hover:bg-[#EFF6FF] hover:border-[#2563EB]"
           )}>
            <RadioGroupItem value={o} id={`tf-${question.id}-${o}`} />
            <Label htmlFor={`tf-${question.id}-${o}`} className="option-text flex-1 cursor-pointer font-normal text-base text-slate-700">{o}</Label>
            {reviewMode && o === correctArr[0] && <CheckCircle2 className="w-6 h-6 text-green-600" />}
          </div>
         );
       })}
    </RadioGroup>
  );
};
