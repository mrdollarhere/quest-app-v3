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

/**
 * Multiple True/False Interaction Module
 * 
 * Features a high-density vertical registry with state-aware feedback.
 * Implements precision toggle buttons and categorical color signatures.
 */
export const MultipleTrueFalseModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const shuffledRows = useMemo(() => {
    const rawRows = parseRegistryArray(question.order_group);
    return reviewMode ? rawRows : shuffleArray(rawRows);
  }, [question.id, question.order_group, reviewMode]);

  const statements = shuffledRows;
  const correctAnswersArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  const originalStatements = useMemo(() => parseRegistryArray(question.order_group), [question.order_group]);
  const responses = (value as Record<string, string>) || {};

  const handleUpdate = (statement: string, val: string) => {
    if (reviewMode) return;
    onChange({ ...responses, [statement]: val });
  };

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500">
      {statements.map((s, i) => {
        const userVal = responses[s];
        const originalIdx = originalStatements.indexOf(s);
        const isCorrect = reviewMode && userVal === correctAnswersArr[originalIdx];
        
        return (
          <div key={i} className="flex flex-col">
            <div 
              role="radiogroup" 
              aria-label={`Select true or false for: ${s}`}
              className={cn(
                "flex flex-row items-start justify-between gap-4 p-4 transition-all border-b border-slate-100 last:border-none rounded-r-xl",
                !userVal && !reviewMode && "bg-white border-l-[3px] border-l-transparent",
                userVal === 'True' && !reviewMode && "bg-[#F0FDF4] border-l-[3px] border-l-[#22C55E]",
                userVal === 'False' && !reviewMode && "bg-[#FEF2F2] border-l-[3px] border-l-[#EF4444]",
                reviewMode && (isCorrect ? "bg-emerald-50/50 border-l-[3px] border-l-emerald-500" : "bg-rose-50/50 border-l-[3px] border-l-rose-500")
              )}
            >
              <div className="flex-1 pt-1">
                <p className="option-text font-normal text-base text-slate-700 leading-tight">{s}</p>
              </div>

              <div className="flex items-center gap-[6px] w-[146px] justify-end shrink-0">
                {['True', 'False'].map((opt) => {
                  const isSelected = userVal === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${opt} — ${s}`}
                      onClick={() => handleUpdate(s, opt)}
                      disabled={reviewMode}
                      className={cn(
                        "w-[70px] h-[36px] rounded-[8px] font-medium text-[12px] uppercase tracking-tight transition-all border",
                        !isSelected && "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                        isSelected && opt === 'True' && "bg-[#22C55E] border-[#22C55E] text-white shadow-sm",
                        isSelected && opt === 'False' && "bg-[#EF4444] border-[#EF4444] text-white shadow-sm",
                        reviewMode && "cursor-default opacity-90"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {reviewMode && !isCorrect && (
              <div className="px-5 py-2 flex items-center gap-2 bg-emerald-50/30 rounded-b-xl border-l-[3px] border-l-emerald-500 animate-in slide-in-from-top-1 duration-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  Correct Registry: {correctAnswersArr[originalIdx]}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
