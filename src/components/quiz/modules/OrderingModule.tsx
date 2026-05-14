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
        if (JSON.stringify(shuffled) === JSON.stringify(correctOrder)) {
          if (shuffled.length > 1) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
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
          const isCorrectPos = reviewMode && String(item).trim() === String(correctOrder[idx] || "").trim();
          return (
            <div 
              key={`${item}-${idx}`} 
              draggable={!reviewMode} 
              onDragStart={() => setDraggedItemIndex(idx)} 
              onDragOver={(e) => { e.preventDefault(); if (draggedItemIndex !== null && draggedItemIndex !== idx && !reviewMode) { const next = [...currentOrder]; const [m] = next.splice(draggedItemIndex, 1); next.splice(idx, 0, m); setDraggedItemIndex(idx); onChange(next); } }} 
              onDragEnd={() => setDraggedItemIndex(null)}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all select-none", 
                !reviewMode ? "bg-white border-slate-100 shadow-sm" : (
                  isCorrectPos ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-rose-50 border-rose-500 shadow-sm"
                )
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-black text-sm shrink-0 border shadow-inner", 
                !reviewMode ? "bg-slate-50 text-slate-400" : (
                  isCorrectPos ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )
              )}>
                {idx + 1}
              </div>
              <div className={cn(
                "option-text flex-1 font-bold",
                reviewMode && isCorrectPos ? "text-emerald-900" : 
                reviewMode && !isCorrectPos ? "text-rose-900" : "text-slate-700"
              )}>
                {item}
              </div>
              {reviewMode ? (
                <div className="flex items-center gap-4">
                  {!isCorrectPos && (
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest hidden sm:inline">
                      Target #{idx + 1}: {correctOrder[idx]}
                    </span>
                  )}
                  {isCorrectPos ? <Check className="w-5 h-5 text-emerald-500 stroke-[3px]" /> : <X className="w-5 h-5 text-rose-500 stroke-[3px]" />}
                </div>
              ) : (
                <GripVertical className="w-5 h-5 text-slate-200" />
              )}
            </div>
          );
        })}
      </div>
      
      {reviewMode && (
        <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em] mb-1">Correct Registry Sequence</p>
            <p className="text-sm font-bold text-emerald-900 tracking-tight">{correctOrder.join(" → ")}</p>
          </div>
        </div>
      )}
    </div>
  );
};
