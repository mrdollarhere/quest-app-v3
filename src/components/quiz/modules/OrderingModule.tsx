"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Question } from '@/types/quiz';
import { Button } from "@/components/ui/button";
import { GripVertical, Info, RotateCcw, Check, X } from "lucide-react";
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
  
  // Terminal Preview Protocol: Maintain internal state for shuffled order to allow interactivity in preview contexts
  const [internalOrder, setInternalOrder] = useState<string[]>([]);
  const [initialShuffle, setInitialShuffle] = useState<string[]>([]);

  const parsedOptions = useMemo(() => {
    return parseRegistryArray(question.options || question.order_group);
  }, [question.options, question.order_group]);

  // Initialization Protocol: Shuffle items exactly once on load or when the set of options changes
  useEffect(() => {
    if (parsedOptions.length > 0) {
      const shuffled = shuffleArray(parsedOptions);
      setInitialShuffle(shuffled);
      setInternalOrder(shuffled);
    } else {
      setInitialShuffle([]);
      setInternalOrder([]);
    }
  }, [parsedOptions]);

  // In production player, value is hoisted. In admin preview, value is null.
  const currentOrder = (value as string[]) || internalOrder;
  const correctOrder = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index || reviewMode) return;
    
    const newOrder = [...currentOrder];
    const itemToMove = newOrder.splice(draggedItemIndex, 1)[0];
    newOrder.splice(index, 0, itemToMove);
    
    setDraggedItemIndex(index);
    
    // Update local state for visual feedback if parent isn't controlling state (admin preview mode)
    if (!value) {
      setInternalOrder(newOrder);
    }
    
    onChange(newOrder);
  };

  const handleReset = () => {
    // Reset to the original shuffled state for this attempt
    setInternalOrder(initialShuffle);
    onChange(initialShuffle);
  };

  if (currentOrder.length === 0 && parsedOptions.length > 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-300 font-bold animate-pulse">
        Initializing Sequence...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!reviewMode && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-medium text-primary">
            <Info className="w-4 h-4" />
            <span>Drag items to reorder them into the correct sequence.</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full gap-2 border-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {currentOrder.map((item, idx) => {
          const isCorrectPos = reviewMode && item === correctOrder[idx];
          const isDragging = draggedItemIndex === idx;

          return (
            <div 
              key={`${item}-${idx}`}
              draggable={!reviewMode}
              onDragStart={() => setDraggedItemIndex(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => setDraggedItemIndex(null)}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 group select-none",
                isDragging ? "opacity-20 bg-slate-100 border-primary border-dashed scale-[0.98]" : "bg-white border-slate-100 shadow-sm",
                !reviewMode && !isDragging && "hover:border-primary/40 hover:shadow-lg cursor-grab active:cursor-grabbing hover:-translate-y-0.5",
                reviewMode && isCorrectPos && "border-emerald-500 bg-emerald-50/50",
                reviewMode && !isCorrectPos && "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 font-black text-slate-400 text-sm shrink-0 border border-slate-100">
                {idx + 1}
              </div>
              <div className="option-text flex-1 font-medium text-slate-700 text-base">{item}</div>
              {reviewMode ? (
                <div className="flex items-center gap-4">
                  {!isCorrectPos && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-destructive/40 leading-none mb-1">Correct: {correctOrder[idx]}</p>
                    </div>
                  )}
                  <div className={cn("p-2 rounded-full shadow-sm", isCorrectPos ? "bg-green-100 text-green-600" : "bg-destructive/10 text-destructive")}>
                    {isCorrectPos ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                </div>
              ) : (
                <GripVertical className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
