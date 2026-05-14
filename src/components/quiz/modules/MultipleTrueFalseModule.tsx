"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { CheckCircle2, AlertCircle } from "lucide-react";
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
  const responses = (value as Record<string, string>) || {};

  const handleUpdate = (statement: string, val: string) => {
    if (reviewMode) return;
    onChange({ ...responses, [statement]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {statements.map((s, i) => {
          const userVal = responses[s];
          const originalIdx = originalStatements.indexOf(s);
          const correctAnswer = correctArr[originalIdx];
          const isCorrect = reviewMode && userVal === correctAnswer;
          
          return (
            <div key={i} className="flex flex-col">
              <div 
                className={cn(
                  "flex flex-row items-center justify-between gap-4 p-4 transition-all border-b border-slate-100 last:border-none rounded-r-xl",
                  !userVal && !reviewMode && "bg-white border-l-[3px] border-l-transparent",
                  userVal === 'True' && !reviewMode && "bg-[#F0FDF4] border-l-[3px] border-l-[#22C55E]",
                  userVal === 'False' && !reviewMode && "bg-[#FEF2F2] border-l-[3px] border-l-[#EF4444]",
                  reviewMode && (isCorrect ? "bg-emerald-50 border-l-[3px] border-l-emerald-500" : "bg-rose-50 border-l-[3px] border-l-rose-500")
                )}
              >
                <div className="flex-1">
                  <p className="option-text font-normal text-base text-slate-700 leading-tight">{s}</p>
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
                          "w-[70px] h-[36px] rounded-[8px] font-black text-[12px] uppercase tracking-tight transition-all border",
                          !isSelected && !isCorrectOption && "bg-white border-slate-200 text-slate-400 hover:bg-slate-50",
                          isSelected && opt === 'True' && "bg-[#22C55E] border-[#22C55E] text-white",
                          isSelected && opt === 'False' && "bg-[#EF4444] border-[#EF4444] text-white",
                          isCorrectOption && !isSelected && "border-[#22C55E] text-[#22C55E] border-dashed border-2",
                          reviewMode && "cursor-default"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {reviewMode && (
        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h5 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Correct Registry Map</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {originalStatements.map((s, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-emerald-100/50">
                <span className="text-emerald-600/70 font-medium truncate max-w-[150px]">{s}</span>
                <span className="font-black text-emerald-700">{correctArr[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
