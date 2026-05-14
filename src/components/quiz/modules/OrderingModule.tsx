"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Question } from '@/types/quiz';
import { Button } from "@/components/ui/button";
import { GripVertical, Info, RotateCcw, Check, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const OrderingModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [initialShuffle, setInitialShuffle] = useState<string[]>([]);
  const hasInitialized = useRef(false);

  const parsedOptions = useMemo(() => parseRegistryArray(question.options || question.order_group), [question.options, question.order_group]);
  const correctOrder = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  useEffect(() => {
    if (parsedOptions.length > 0 && !hasInitialized.current) {
      if (!value) {
        let shuffled = shuffleArray(parsedOptions);
        if (JSON.stringify(shuffled) === JSON.stringify(correctOrder)) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        setInitialShuffle(shuffled);
        onChange(shuffled);
      } else {
        setInitialShuffle(value);
      }
      hasInitialized.current = true;
    }
  }, [parsedOptions, value, correctOrder, onChange]);

  const currentOrder = (value as string[]) || [];

  return (
    <div className="space-y-6">
      {!reviewMode && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-[10px] font-black uppercase text-primary">
            <Info className="w-4 h-4" /> Drag to reorder the registry nodes
          </div>
          <Button variant="outline" size="sm" onClick={() => onChange(initialShuffle)} className="rounded-full gap-2 border-2 hover:bg-slate-50"><RotateCcw className="w-4 h-4" /> Reset</Button>
        </div>
      )}

      <div className="space-y-3">
        {currentOrder.map((item, idx) => {
          const isCorrectPos = reviewMode && item === correctOrder[idx];
          return (
            <div 
              key={`${item}-${idx}`} 
              draggable={!reviewMode} 
              onDragStart={() => setDraggedItemIndex(idx)} 
              onDragOver={(e) => { e.preventDefault(); if (draggedItemIndex !== null && draggedItemIndex !== idx && !reviewMode) { const next = [...currentOrder]; const [m] = next.splice(draggedItemIndex, 1); next.splice(idx, 0, m); setDraggedItemIndex(idx); onChange(next); } }} 
              onDragEnd={() => setDraggedItemIndex(null)}
              className={cn("flex items-center gap-4 p-5 rounded-2xl border-2 transition-all select-none", isCorrectPos ? "bg-emerald-50 border-emerald-200" : (reviewMode ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100 shadow-sm"))}
            >
              <div className={cn("flex items-center justify-center w-10 h-10 rounded-full font-black text-sm shrink-0 border", isCorrectPos ? "bg-emerald-500 text-white" : (reviewMode ? "bg-rose-500 text-white" : "bg-slate-50 text-slate-400"))}>{idx + 1}</div>
              <div className="option-text flex-1 font-bold text-slate-700">{item}</div>
              {reviewMode ? (
                <div className="flex items-center gap-4">
                  {!isCorrectPos && <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Expected: {correctOrder[idx]}</span>}
                  {isCorrectPos ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-rose-500" />}
                </div>
              ) : <GripVertical className="w-5 h-5 text-slate-200" />}
            </div>
          );
        })}
      </div>
      
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            Target Sequence: <span className="font-bold lowercase tracking-normal">{correctOrder.join(" → ")}</span>
          </p>
        </div>
      )}
    </div>
  );
};
