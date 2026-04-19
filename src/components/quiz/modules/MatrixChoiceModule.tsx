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
 * Implements the High-Fidelity Matrix Choice Protocol (v18.6) with absolute equal-width columns.
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

  // Balanced Geometry Protocol: All columns (label + N answer columns) share equal width (1fr)
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns.length + 1}, 1fr)`,
    alignItems: 'stretch'
  };

  return (
    <div className="w-full relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-full inline-block align-middle">
          {/* Header Row: Sticky left for row labels, bottom border for separation */}
          <div style={gridStyle} className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div 
              className="sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 pl-6 pr-4 py-6 flex items-center border-r border-slate-200 dark:border-slate-700"
            >
               {/* Parameter header intentionally left empty per Protocol v18.5 */}
            </div>
            {columns.map((col, i) => (
              <div key={i} className="text-center px-4 py-6 border-r border-slate-200/50 dark:border-slate-700/50 last:border-r-0 flex items-center justify-center">
                <span className="option-text text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider leading-tight text-center line-clamp-2 overflow-hidden">
                  {col}
                </span>
              </div>
            ))}
          </div>

          {/* Content Rows: Alternating backgrounds and horizontal tracking */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, i) => {
              const userVal = responses[row];
              const originalIdx = originalRows.indexOf(row);
              const isCorrectRow = reviewMode && userVal === correctAnswersArr[originalIdx];

              return (
                <div 
                  key={i} 
                  style={gridStyle}
                  className={cn(
                    "group transition-all duration-200",
                    i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30",
                    !reviewMode && "hover:bg-primary/5",
                    reviewMode && !isCorrectRow && userVal ? "bg-rose-50/30 dark:bg-rose-900/10" : ""
                  )}
                >
                  {/* Parameter Label: Sticky implementation for horizontal tracing */}
                  <div 
                    className={cn(
                      "sticky left-0 z-10 pl-6 pr-4 py-5 flex items-center transition-colors border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.02)]",
                      i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50",
                      "group-hover:bg-primary/[0.03]"
                    )}
                  >
                    <p className="option-text text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight text-left">
                      {row}
                    </p>
                  </div>

                  {/* Interaction Nodes: Vertical dividers and selected cell highlighting */}
                  {columns.map((col, j) => {
                    const isSelected = userVal === col;
                    const isCorrectChoice = reviewMode && isSelected && col === correctAnswersArr[originalIdx];
                    const isWrongChoice = reviewMode && isSelected && col !== correctAnswersArr[originalIdx];

                    return (
                      <div 
                        key={j} 
                        className={cn(
                          "flex items-center justify-center border-r border-slate-200/50 dark:border-slate-700/50 last:border-r-0 transition-colors p-4",
                          isSelected ? "bg-primary/[0.04] dark:bg-primary/[0.08]" : ""
                        )}
                        onClick={() => handleUpdate(row, col)}
                      >
                        <div className={cn(
                          "w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center cursor-pointer shadow-sm",
                          isSelected 
                            ? "bg-[#3B5BDB] border-[#3B5BDB]" 
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600",
                          reviewMode && isWrongChoice && "bg-rose-500 border-rose-500",
                          reviewMode && isCorrectChoice && "bg-emerald-500 border-emerald-500",
                          reviewMode && "cursor-default"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
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
  );
};
