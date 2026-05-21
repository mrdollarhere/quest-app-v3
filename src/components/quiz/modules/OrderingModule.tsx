"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Question } from '@/types/quiz';
import { Button } from "@/components/ui/button";
import { GripVertical, Info, RotateCcw, Check, X, CheckCircle2, Lightbulb, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray, compareValues } from '@/lib/quiz-utils';

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
      if (!value && !reviewMode) {
        let shuffled = shuffleArray(parsedOptions);
        if (JSON.stringify(shuffled) === JSON.stringify(correctOrder)) {
          if (shuffled.length > 1) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        setInitialShuffle(shuffled);
        onChange(shuffled);
      } else {
        setInitialShuffle(value || []);
      }
      hasInitialized.current = true;
    }
  }, [parsedOptions, value, correctOrder, onChange, reviewMode]);

  const currentOrder = (value as string[]) || [];
  const isSkipped = reviewMode && currentOrder.length === 0;

  return (
    <div className="space-y-6">
      {isSkipped && (
        <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-4 text-amber-700 animate-in slide-in-from-top-2">
          <CircleOff className="w-5 h-5" />
          <p className="text-xs font-black uppercase tracking-tight">Sequence skipped / Chuỗi chưa được sắp xếp</p>
        </div>
      )}

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
          const isCorrectPos = reviewMode && compareValues(item, correctOrder[idx]);
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
                  isCorrectPos ? "bg-emerald-50 border-emerald-500 border-l-[6px] shadow-sm" : "bg-rose-50 border-rose-500 border-l-[6px] shadow-sm"
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
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-widest hidden sm:inline">
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
        <div className="p-6 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-500 border-dashed flex flex-col gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl"><Lightbulb className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em]">Correct Registry Sequence / Thứ tự đúng</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {correctOrder.map((step, sidx) => (
              <React.Fragment key={sidx}>
                <div className="px-3 py-1.5 bg-white border border-emerald-100 rounded-lg text-xs font-black text-emerald-700 shadow-sm">{step}</div>
                {sidx < correctOrder.length - 1 && <span className="text-emerald-300 font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};