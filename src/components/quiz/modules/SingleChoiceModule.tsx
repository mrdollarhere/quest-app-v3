"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
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

  const correctAnswer = useMemo(() => parseRegistryArray(question.correct_answer)[0], [question.correct_answer]);

  return (
    <RadioGroup 
      value={value || ""} 
      onValueChange={onChange}
      disabled={reviewMode}
      className="flex flex-col gap-[10px]"
    >
      {options.map((option, idx) => {
        const isSelected = value === option;
        
        return (
          <div key={idx} className={cn(
            "flex items-center space-x-3 px-[18px] py-[14px] rounded-[12px] border transition-all cursor-pointer",
            isSelected 
              ? "bg-[#EFF6FF] border-[#2563EB] shadow-sm" 
              : "bg-white border-[#E5E7EB] hover:bg-[#EFF6FF] hover:border-[#2563EB]"
          )}>
            <RadioGroupItem value={option} id={`q-${question.id}-${idx}`} />
            <Label htmlFor={`q-${question.id}-${idx}`} className="option-text flex-1 cursor-pointer font-normal text-base text-slate-700">{option}</Label>
            {reviewMode && option === correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>
        );
      })}
    </RadioGroup>
  );
};
