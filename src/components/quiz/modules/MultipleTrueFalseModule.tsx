"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { CheckCircle2, Check, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray, compareValues } from '@/lib/quiz-utils';

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
          const originalIdx = originalStatements.indexOf(s);
          const correctAnswer = correctArr[originalIdx];
          
          const userKey = Object.keys(responses).find(k => k.trim().toLowerCase() === s.trim().toLowerCase());
          const userVal = userKey ? responses[userKey] : undefined;
          
          const isCorrect = reviewMode && compareValues(userVal, correctAnswer);
          const isSkipped = reviewMode && userVal === undefined;
          
          return (
            <div key={i} className="flex flex-col gap-2">
              <div 
                className={cn(
                  "flex flex-row items-start justify-between gap-4 p-5 transition-all border shadow-sm rounded-2xl",
                  !reviewMode ? (
                    !userVal ? "bg-white border-slate-100" :
                    compareValues(userVal, 'True') ? "bg-green-50 border-green-500" :
                    "bg-red-50 border-red-500"
                  ) : (
                    isCorrect ? "bg-emerald-50 border-emerald-500" : 
                    (isSkipped ? "bg-amber-50 border-amber-400" : "bg-rose-50 border-rose-500")
                  )
                )}
              >
                <div className="flex-1 min-w-0 py-1.5">
                  <p className={cn(
                    "option-text font-normal text-base leading-snug break-words whitespace-normal",
                    reviewMode && isCorrect ? "text-emerald-900 font-bold" : 
                    reviewMode && !isCorrect && !isSkipped ? "text-rose-900 font-bold" : "text-slate-700"
                  )}>{s}</p>
                </div>

                <div className="flex items-center gap-[8px] shrink-0 pt-0.5">
                  {isSkipped && <HelpCircle className="w-5 h-5 text-amber-500 animate-pulse" />}
                  
                  <div className="flex items-center gap-[6px] w-[156px] justify-end">
                    {['True', 'False'].map((opt) => {
                      const isSelected = compareValues(userVal, opt);
                      const isOptionCorrect = compareValues(opt, correctAnswer);
                      const isSelectedCorrectly = isSelected && isOptionCorrect && reviewMode;
                      const isSelectedIncorrectly = isSelected && !isOptionCorrect && reviewMode;
                      const isMissedCorrectly = !isSelected && isOptionCorrect && reviewMode;

                      return (
                        <div key={opt} className="relative flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(s, opt)}
                            disabled={reviewMode}
                            className={cn(
                              "w-[70px] h-[36px] rounded-[10px] font-black text-[12px] uppercase tracking-tight transition-all border flex items-center justify-center gap-1",
                              !isSelected && (!reviewMode || !isOptionCorrect) && "bg-white border-slate-200 text-slate-400 hover:bg-slate-50",
                              isSelected && !reviewMode && (opt === 'True' ? "bg-green-600 border-green-600 text-white" : "bg-red-600 border-red-600 text-white"),
                              isSelectedCorrectly && "bg-emerald-600 border-emerald-600 text-white",
                              isSelectedIncorrectly && "bg-rose-600 border-rose-600 text-white",
                              isMissedCorrectly && "bg-white border-emerald-500 border-dashed border-2 text-emerald-600",
                              reviewMode && "cursor-default"
                            )}
                          >
                            {opt}
                            {isSelectedCorrectly && <Check className="w-3 h-3 text-white" />}
                            {isSelectedIncorrectly && <X className="w-3 h-3 text-white" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {reviewMode && !isCorrect && (
                <div className={cn(
                  "mx-4 px-4 py-1.5 rounded-b-xl text-[9px] font-black uppercase tracking-widest -mt-4 pt-4 border-x border-b border-dashed flex items-center justify-between",
                  isSkipped ? "bg-amber-100/30 border-amber-200 text-amber-600" : "bg-emerald-100/30 border-emerald-200 text-emerald-600"
                )}>
                  <span>{isSkipped ? "NOT ANSWERED / CHƯA TRẢ LỜI" : "YOUR ANSWER / CÂU TRẢ LỜI CỦA BẠN"}</span>
                  <div className="flex items-center gap-4">
                    {!isSkipped && <span className="text-rose-500">{userVal}</span>}
                    <span className="text-emerald-600">Correct: {correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
