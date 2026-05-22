"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Check, CheckCircle2, X, HelpCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray, compareValues } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const MatrixChoiceModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const originalRows = useMemo(() => parseRegistryArray(question.order_group), [question.order_group]);
  const rows = useMemo(() => reviewMode ? originalRows : shuffleArray(originalRows), [originalRows, reviewMode]);
  
  const columns = useMemo(() => parseRegistryArray(question.options), [question.options]);
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  
  const responses = useMemo(() => (value as Record<string, string>) || {}, [value]);

  const handleUpdate = (row: string, col: string) => {
    if (reviewMode) return;
    onChange({ ...responses, [row]: col });
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns.length + 1}, 1fr)`,
    alignItems: 'stretch'
  };

  return (
    <div className="space-y-6">
      <div className="w-full relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-full inline-block align-middle">
            <div style={gridStyle} className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
              <div className="sticky left-0 bg-slate-50 z-20 pl-6 pr-4 py-6 flex items-center border-r border-slate-200"></div>
              {columns.map((col, i) => (
                <div key={i} className="text-center px-4 py-6 border-r border-slate-200/50 last:border-r-0 flex items-center justify-center">
                  <span className="option-text text-[11px] font-black uppercase text-slate-600 tracking-wider text-center break-words whitespace-normal">{col}</span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {rows.map((row, i) => {
                const userVal = responses[row];
                const originalIdx = originalRows.indexOf(row);
                const correctAnswer = correctArr[originalIdx];
                const isSkippedRow = reviewMode && !userVal;
                const isCorrectRow = reviewMode && compareValues(userVal, correctAnswer);

                return (
                  <div key={i} style={gridStyle} className={cn(
                    "group transition-all duration-200", 
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/30", 
                    reviewMode && isCorrectRow ? "bg-emerald-50/30" : 
                    reviewMode && isSkippedRow ? "bg-amber-50/30" :
                    reviewMode && userVal ? "bg-rose-50/30" : ""
                  )}>
                    <div className={cn(
                      "sticky left-0 z-10 pl-6 pr-4 py-5 flex items-center border-r border-slate-200 shadow-sm transition-colors", 
                      i % 2 === 0 ? "bg-white" : "bg-slate-50",
                      isSkippedRow && "bg-amber-50"
                    )}>
                      <div className="flex flex-col gap-1 w-full">
                        <p className={cn(
                          "option-text text-sm leading-snug break-words whitespace-normal",
                          reviewMode && isCorrectRow ? "text-emerald-700 font-bold" : 
                          reviewMode && !isCorrectRow && userVal ? "text-rose-700 font-bold" : 
                          isSkippedRow ? "text-amber-700 font-bold" : "text-slate-700"
                        )}>{row}</p>
                        {isSkippedRow && <span className="text-[8px] font-black uppercase text-amber-500 tracking-tighter">Skipped / Bỏ qua</span>}
                      </div>
                    </div>

                    {columns.map((col, j) => {
                      const isSelected = compareValues(userVal, col);
                      const isTarget = compareValues(col, correctAnswer);
                      const isCorrectChoice = reviewMode && isSelected && isTarget;
                      const isWrongChoice = reviewMode && isSelected && !isTarget;
                      const isMissedChoice = reviewMode && !isSelected && isTarget;

                      return (
                        <div key={j} className="flex items-center justify-center border-r border-slate-200/50 last:border-r-0 p-4" onClick={() => handleUpdate(row, col)}>
                          <div className={cn(
                            "w-[28px] h-[28px] rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-sm",
                            isSelected && !reviewMode ? "bg-blue-600 border-blue-600" : "border-slate-200 bg-white",
                            isCorrectChoice && "bg-emerald-500 border-emerald-500 shadow-lg scale-110",
                            isWrongChoice && "bg-rose-500 border-rose-500 shadow-lg",
                            isMissedChoice && "border-emerald-500 border-dashed border-2 scale-110",
                            reviewMode && "cursor-default"
                          )}>
                            {isCorrectChoice && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                            {isWrongChoice && <X className="w-4 h-4 text-white stroke-[4px]" />}
                            {isMissedChoice && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px]" />}
                            {(isSelected && !reviewMode) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {reviewMode && (
        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h5 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Correct Registry Matrix / Ma trận đáp án</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {originalRows.map((row, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-emerald-100/50">
                <span className="text-emerald-600/70 font-medium break-words whitespace-normal max-w-[150px]">{row}</span>
                <span className="font-black text-emerald-700 ml-2 shrink-0">{correctArr[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
