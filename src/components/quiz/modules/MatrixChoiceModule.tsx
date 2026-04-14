"use client";

import React, { useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

/**
 * Matrix Choice Interaction Module
 * 
 * Features a high-precision grid system for mapping attributes across multiple rows.
 * Implements the High-Fidelity Matrix Choice Protocol (v18.5).
 */
export const MatrixChoiceModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const shuffledRows = useMemo(() => {
    const rawRows = parseRegistryArray(question.order_group);
    return reviewMode ? rawRows : shuffleArray(rawRows);
  }, [question.id, question.order_group, reviewMode]);

  const options = useMemo(() => {
    const rawOptions = parseRegistryArray(question.options);
    return reviewMode ? rawOptions : shuffleArray(rawOptions);
  }, [question.id, question.options, reviewMode]);

  const rows = shuffledRows;
  const columns = options;
  const correctAnswersArr = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);
  const originalRows = useMemo(() => parseRegistryArray(question.order_group), [question.order_group]);
  const responses = (value as Record<string, string>) || {};

  const handleUpdate = (row: string, col: string) => {
    if (reviewMode) return;
    onChange({ ...responses, [row]: col });
  };

  // Structural Protocol: Use CSS grid for perfect column synchronization
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `1fr repeat(${columns.length}, 80px)`,
    alignItems: 'center'
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
      <div className="min-w-[600px]">
        {/* Header Row: Empty top-left, centered labels */}
        <div style={gridStyle} className="border-b border-slate-100 pb-4 mb-2 px-2">
          <div /> {/* Removed "PARAMETER" label per Protocol v18.5 */}
          {columns.map((col, i) => (
            <div key={i} className="text-center px-1">
              <span className="option-text text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Content Rows: Dynamic backgrounds and borders */}
        <div className="divide-y divide-slate-100">
          {rows.map((row, i) => {
            const userVal = responses[row];
            const hasSelection = !!userVal;
            const originalIdx = originalRows.indexOf(row);
            const isCorrectRow = reviewMode && userVal === correctAnswersArr[originalIdx];

            return (
              <div 
                key={i} 
                style={gridStyle}
                className={cn(
                  "group transition-all py-5 px-2 rounded-xl",
                  hasSelection ? "bg-[#EFF6FF]" : "bg-transparent",
                  !reviewMode && "hover:bg-slate-50",
                  reviewMode && !isCorrectRow ? "opacity-80" : "opacity-100"
                )}
              >
                {/* Parameter Label */}
                <div className="pr-6">
                  <p className="option-text text-sm font-normal text-slate-700 leading-tight">
                    {row}
                  </p>
                </div>

                {/* Interaction Nodes */}
                {columns.map((col, j) => {
                  const isSelected = userVal === col;
                  const isCorrectChoice = reviewMode && isSelected && col === correctAnswersArr[originalIdx];
                  const isWrongChoice = reviewMode && isSelected && col !== correctAnswersArr[originalIdx];

                  return (
                    <div 
                      key={j} 
                      className="flex justify-center"
                      onClick={() => handleUpdate(row, col)}
                    >
                      <div className={cn(
                        "w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center cursor-pointer",
                        isSelected 
                          ? "bg-[#3B5BDB] border-[#3B5BDB] shadow-sm" 
                          : "border-slate-200 bg-white group-hover:border-slate-300",
                        reviewMode && isWrongChoice && "bg-rose-500 border-rose-500",
                        reviewMode && isCorrectChoice && "bg-emerald-500 border-emerald-500",
                        reviewMode && "cursor-default"
                      )}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
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
  );
};
