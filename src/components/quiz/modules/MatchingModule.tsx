"use client";

import React, { useState, useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Info, X, CheckCircle2, AlertCircle, ArrowRight, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray, shuffleArray } from '@/lib/quiz-utils';

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

const MatchingAnswerContent = ({ value }: { value: string }) => {
  const [error, setError] = useState(false);
  const isImage = useMemo(() => {
    if (!value) return false;
    const val = String(value).trim();
    return (val.startsWith('http') && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(val)) || val.startsWith('https://');
  }, [value]);

  if (!isImage) {
    return (
      <span className="option-text font-bold text-xs text-center leading-relaxed break-words px-2 py-1">
        {value}
      </span>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[80px] bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <AlertCircle className="w-4 h-4 text-slate-300" />
        <span className="text-[8px] font-black text-slate-300 uppercase mt-1">Broken Asset</span>
      </div>
    );
  }

  return (
    <img 
      src={value} 
      alt="Answer Node" 
      onError={() => setError(true)} 
      className="max-w-full max-h-[120px] object-contain rounded-xl border bg-white shadow-sm p-1" 
    />
  );
};

export const MatchingModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  const matchingPairs = useMemo(() => {
    const pairsArr = parseRegistryArray(question.order_group);
    return pairsArr.map(p => {
      const [left, right] = String(p).split('|');
      return { left: (left || "").trim(), right: (right || "").trim() };
    });
  }, [question.order_group]);

  const shuffledPool = useMemo(() => shuffleArray(matchingPairs.map(p => p.right)), [matchingPairs]);
  const responses = useMemo(() => (value as Record<string, string>) || {}, [value]);
  
  const assignedAnswers = Object.values(responses);
  const availableAnswers = shuffledPool.filter(ans => !assignedAnswers.includes(ans));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={cn(reviewMode ? "lg:col-span-12" : "lg:col-span-7", "space-y-4")}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 px-1">Registry Alignment</h3>
          <div className={cn("grid gap-4", reviewMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
            {matchingPairs.map((pair, i) => {
              const userVal = responses[pair.left];
              const isCorrect = reviewMode && String(userVal || "").trim().toLowerCase() === String(pair.right).trim().toLowerCase();

              return (
                <div key={i} className="flex flex-col">
                  <div className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all flex flex-col sm:flex-row items-center gap-8 min-h-[140px]",
                    !reviewMode ? "bg-white border-slate-100 shadow-sm" : (
                      isCorrect ? "bg-emerald-50 border-emerald-500 shadow-sm" : 
                      (userVal ? "bg-rose-50 border-rose-500 shadow-sm" : "bg-slate-50 border-slate-200 opacity-60")
                    )
                  )}>
                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Key Node</span>
                      <p className={cn("option-text font-bold text-lg leading-tight", reviewMode && isCorrect ? "text-emerald-900" : "text-slate-700")}>
                        {pair.left}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-center">
                      {reviewMode && (
                        <div className={cn("p-2 rounded-full shadow-lg shrink-0", isCorrect ? "bg-emerald-500" : "bg-rose-500")}>
                          {isCorrect ? <Check className="w-4 h-4 text-white stroke-[3px]" /> : <XIcon className="w-4 h-4 text-white stroke-[3px]" />}
                        </div>
                      )}
                      <div 
                        onDragOver={(e) => {
                          if (reviewMode) return;
                          e.preventDefault();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        }}
                        onDrop={(e) => {
                          if (reviewMode) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          const data = e.dataTransfer.getData("text/plain");
                          if (data) onChange({ ...responses, [pair.left]: data });
                        }}
                        className={cn(
                          "min-w-[180px] w-full sm:w-[220px] min-h-[100px] rounded-[1.5rem] border-2 border-dashed flex items-center justify-center transition-all p-4 relative shrink-0",
                          userVal ? (reviewMode ? "border-transparent bg-white/50" : "border-primary bg-white shadow-lg") : "border-slate-300 bg-slate-50/50"
                        )}
                      >
                        {userVal ? (
                          <div className="flex flex-col items-center justify-center w-full">
                            <MatchingAnswerContent value={userVal} />
                            {!reviewMode && (
                              <button 
                                onClick={() => { 
                                  const next = { ...responses }; 
                                  delete next[pair.left]; 
                                  onChange(next); 
                                }} 
                                className="absolute -top-3 -right-3 p-1.5 bg-white border-2 border-slate-100 rounded-full shadow-xl hover:text-rose-500 hover:border-rose-100 transition-all z-10"
                                aria-label="Clear node allocation"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center px-2">
                            {reviewMode ? "NO SUBMISSION" : "Drop Data Node"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {reviewMode && !isCorrect && (
                    <div className="mx-8 p-4 bg-emerald-50/40 rounded-b-[2rem] border-x border-b border-emerald-200 border-dashed flex items-center justify-between animate-in slide-in-from-top-1 -mt-4 pt-8">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Correct Alignment:</span>
                      </div>
                      <div className="max-w-[220px]">
                        <MatchingAnswerContent value={pair.right} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!reviewMode && (
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-10 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200 min-h-[450px]">
              <div className="text-center mb-10">
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mb-2">Unallocated Intelligence</h3>
                <p className="text-[10px] font-medium text-slate-400">Drag items from this pool to the registry targets</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {availableAnswers.map((ans, i) => (
                  <div 
                    key={i} 
                    draggable 
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", ans);
                      setDraggingItem(ans);
                    }} 
                    onDragEnd={() => setDraggingItem(null)} 
                    className={cn(
                      "p-4 bg-white border-2 border-white rounded-[1.5rem] shadow-sm cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-2xl transition-all duration-300",
                      draggingItem === ans && "opacity-20 grayscale scale-95"
                    )}
                  >
                    <div className="max-w-[200px]">
                      <MatchingAnswerContent value={ans} />
                    </div>
                  </div>
                ))}
              </div>
              {availableAnswers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">All Nodes Allocated</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
