"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const MultipleTrueFalseModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const originalStatements = useMemo(() => parseRegistryArray(question.order_group), [question.order_group]);
  const statements = useMemo(() => reviewMode ? originalStatements : shuffleArray(originalStatements), [originalStatements, reviewMode]);
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  
  const responses = useMemo(() => (value as Record<string, string>) || {}, [value]);

  const handleUpdate = (statement: string, val: string) => {
    if (reviewMode) return;
    onChange({ ...responses, [statement]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {statements.map((s, i) => {
          // ASSOCIATION LOOKUP: Find the correct value based on original index in order_group
          const originalIdx = originalStatements.indexOf(s);
          const correctAnswer = correctArr[originalIdx];
          
          // User response lookup with case-insensitive normalization guard
          const userKey = Object.keys(responses).find(k => k.trim().toLowerCase() === s.trim().toLowerCase());
          const userVal = userKey ? responses[userKey] : undefined;
          
          const isCorrect = reviewMode && userVal === correctAnswer;
          
          return (
            <div key={i} className="flex flex-col gap-2">
              <div 
                className={cn(
                  "flex flex-row items-center justify-between gap-4 p-5 transition-all border shadow-sm rounded-2xl",
                  !reviewMode ? (
                    !userVal ? "bg-white border-slate-100" :
                    userVal === 'True' ? "bg-[#F0FDF4] border-[#22C55E]" :
                    "bg-[#FEF2F2] border-[#EF4444]"
                  ) : (
                    isCorrect ? "bg-emerald-50 border-emerald-500" : 
                    (userVal ? "bg-rose-50 border-rose-500" : "bg-slate-50 border-slate-200")
                  )
                )}
              >
                <div className="flex-1">
                  <p className={cn(
                    "option-text font-normal text-base leading-tight",
                    reviewMode && isCorrect ? "text-emerald-900 font-bold" : 
                    reviewMode && !isCorrect && userVal ? "text-rose-900 font-bold" : "text-slate-700"
                  )}>{s}</p>
                </div>

                <div className="flex items-center gap-[6px] w-[146px] justify-end shrink-0">
                  {['True', 'False'].map((opt) => {
                    const isSelected = userVal === opt;
                    const isCorrectOption = reviewMode && opt === correctAnswer;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleUpdate(s, opt)}
                        disabled={reviewMode}
                        className={cn(
                          "w-[70px] h-[36px] rounded-[10px] font-black text-[12px] uppercase tracking-tight transition-all border",
                          !isSelected && !isCorrectOption && "bg-white border-slate-200 text-slate-400 hover:bg-slate-50",
                          isSelected && opt === 'True' && "bg-[#22C55E] border-[#22C55E] text-white",
                          isSelected && opt === 'False' && "bg-[#EF4444] border-[#EF4444] text-white",
                          reviewMode && isCorrectOption && !isSelected && "border-[#22C55E] text-[#22C55E] border-dashed border-2",
                          reviewMode && "cursor-default"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {reviewMode && (
                <div className={cn(
                  "mx-4 px-4 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-widest -mt-4 pt-4 border-x border-b",
                  isCorrect ? "bg-emerald-100/50 border-emerald-200 text-emerald-700" : "bg-rose-100/50 border-rose-200 text-rose-700"
                )}>
                  Correct Registry: <span className="font-black underline">{correctAnswer}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
