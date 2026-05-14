"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const MatrixChoiceModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const originalRows = useMemo(() => parseRegistryArray(question.order_group), [question.order_group]);
  const rows = useMemo(() => reviewMode ? originalRows : shuffleArray(originalRows), [originalRows, reviewMode]);
  
  // Bug 2 Fix: Column headers come from 'options' field
  const columns = useMemo(() => parseRegistryArray(question.options), [question.options]);
  const correctArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  
  // Bug 1 Fix: Ensure responses are correctly read from the 'value' prop which contains submittedAnswer in reviewMode
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
                  <span className="option-text text-[11px] font-black uppercase text-slate-600 tracking-wider text-center">{col}</span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {rows.map((row, i) => {
                const userVal = responses[row];
                const originalIdx = originalRows.indexOf(row);
                const correctAnswer = correctArr[originalIdx];
                const isCorrectRow = reviewMode && String(userVal || "").trim().toLowerCase() === String(correctAnswer || "").trim().toLowerCase();

                return (
                  <div key={i} style={gridStyle} className={cn("group transition-all duration-200", i % 2 === 0 ? "bg-white" : "bg-slate-50/50", reviewMode && !isCorrectRow && userVal ? "bg-rose-50/30" : "")}>
                    <div className={cn("sticky left-0 z-10 pl-6 pr-4 py-5 flex items-center border-r border-slate-200 shadow-sm", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                      <p className="option-text text-sm font-medium text-slate-700 leading-tight">{row}</p>
                    </div>

                    {columns.map((col, j) => {
                      const isSelected = String(userVal || "").trim().toLowerCase() === String(col).trim().toLowerCase();
                      const isCorrectChoice = reviewMode && String(col).trim().toLowerCase() === String(correctAnswer || "").trim().toLowerCase();
                      const isWrongChoice = reviewMode && isSelected && !isCorrectChoice;

                      return (
                        <div key={j} className="flex items-center justify-center border-r border-slate-200/50 last:border-r-0 p-4" onClick={() => handleUpdate(row, col)}>
                          <div className={cn(
                            "w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center cursor-pointer shadow-sm",
                            isSelected ? "bg-primary border-primary" : "border-slate-200 bg-white",
                            reviewMode && isCorrectChoice && "bg-emerald-500 border-emerald-500 ring-2 ring-emerald-200",
                            reviewMode && isWrongChoice && "bg-rose-500 border-rose-500",
                            reviewMode && "cursor-default"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                            {reviewMode && !isSelected && isCorrectChoice && <Check className="w-3 h-3 text-white" />}
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
            <h5 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Correct Registry Matrix</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {originalRows.map((row, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-emerald-100/50">
                <span className="text-emerald-600/70 font-medium truncate max-w-[150px]">{row}</span>
                <span className="font-black text-emerald-700">{correctArr[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};