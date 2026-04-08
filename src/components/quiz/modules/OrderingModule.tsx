"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const hasInitialized = useRef(false);

  const parsedOptions = useMemo(() => {
    // Use options field first, then fallback to order_group (DB schema flexibility)
    return parseRegistryArray(question.options || question.order_group);
  }, [question.options, question.order_group]);

  const correctOrder = useMemo(() => parseRegistryArray(question.correct_answer), [question.correct_answer]);

  // Initialization Protocol: Shuffle items exactly once on load or when the question changes
  useEffect(() => {
    // Check if parent already has a saved value for this question
    const parentValue = (Array.isArray(value) && value.length > 0) ? value : null;

    if (parsedOptions.length > 0) {
      if (!parentValue) {
        // First load: Shuffle and notify parent
        let shuffled = shuffleArray(parsedOptions);
        
        // Never show in correct order protocol
        const correctOrderStr = JSON.stringify(correctOrder);
        if (shuffled.length > 1 && JSON.stringify(shuffled) === correctOrderStr) {
          [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        
        setInitialShuffle(shuffled);
        setInternalOrder(shuffled);
        onChange(shuffled);
      } else {
        // Returning to question: Use existing parent value
        setInternalOrder(parentValue);
        // If it's the first time we see this question ID, capture the initial state for the Reset button
        if (!hasInitialized.current) {
          setInitialShuffle(parentValue);
        }
      }
      hasInitialized.current = true;
    }
  }, [question.id, question.options, question.order_group]); // Stability dependency: triggers on actual content change

  // Synchronize local drag state with parent response state
  const currentOrder = (value as string[]) || internalOrder;

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index || reviewMode) return;
    
    const newOrder = [...currentOrder];
    const itemToMove = newOrder.splice(draggedItemIndex, 1)[0];
    newOrder.splice(index, 0, itemToMove);
    
    setDraggedItemIndex(index);
    
    // Admin Preview Support: Update local state if parent isn't providing a response registry yet
    if (!value) {
      setInternalOrder(newOrder);
    }
    
    onChange(newOrder);
  };

  const handleReset = () => {
    // Reset to the original shuffled state captured at start of mission attempt
    if (initialShuffle.length > 0) {
      setInternalOrder(initialShuffle);
      onChange(initialShuffle);
    }
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            disabled={JSON.stringify(currentOrder) === JSON.stringify(initialShuffle)}
            className="rounded-full gap-2 border-2 hover:bg-slate-50"
          >
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
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-black text-sm shrink-0 border",
                reviewMode 
                  ? (isCorrectPos ? "bg-emerald-500 text-white border-emerald-400" : "bg-destructive text-white border-destructive/50")
                  : "bg-slate-50 text-slate-400 border-slate-100"
              )}>
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
