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

  if (!isImage) return <span className="option-text font-black text-xs text-center leading-tight">{value}</span>;

  if (error) return <div className="w-[120px] h-[80px] bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200"><AlertCircle className="w-4 h-4 text-slate-300" /><span className="text-[8px] font-black text-slate-300 uppercase mt-1">Broken</span></div>;

  return <img src={value} alt="Answer" onError={() => setError(true)} className="w-[120px] h-[80px] object-contain rounded-xl border bg-white shadow-sm" />;
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Registry Targets</h3>
          <div className={cn("grid gap-4", reviewMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
            {matchingPairs.map((pair, i) => {
              const userVal = responses[pair.left];
              const isCorrect = reviewMode && String(userVal || "").trim().toLowerCase() === String(pair.right).trim().toLowerCase();

              return (
                <div key={i} className="space-y-0">
                  <div className={cn(
                    "p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center gap-6",
                    !reviewMode ? "bg-white border-slate-100" : (
                      isCorrect ? "bg-emerald-50 border-emerald-500 shadow-sm" : 
                      (userVal ? "bg-rose-50 border-rose-500 shadow-sm" : "bg-slate-50 border-slate-200 opacity-60")
                    )
                  )}>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Key Node</span>
                      <p className={cn("option-text font-bold text-lg", reviewMode && isCorrect ? "text-emerald-900" : "text-slate-700")}>{pair.left}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {reviewMode && (
                        <div className={cn("p-2 rounded-full", isCorrect ? "bg-emerald-500" : "bg-rose-500")}>
                          {isCorrect ? <Check className="w-4 h-4 text-white" /> : <XIcon className="w-4 h-4 text-white" />}
                        </div>
                      )}
                      <div 
                        onDragOver={(e) => !reviewMode && (e.preventDefault(), e.currentTarget.classList.add('border-primary'))}
                        onDragLeave={(e) => e.currentTarget.classList.remove('border-primary')}
                        onDrop={(e) => {
                          if (reviewMode) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary');
                          const data = e.dataTransfer.getData("text/plain");
                          if (data) onChange({ ...responses, [pair.left]: data });
                        }}
                        className={cn(
                          "w-[140px] h-[100px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all p-2 relative shrink-0",
                          userVal ? (reviewMode ? "border-transparent bg-white/50" : "border-primary bg-white shadow-sm") : "border-slate-300 bg-slate-50"
                        )}
                      >
                        {userVal ? (
                          <div className="flex flex-col items-center gap-2">
                            <MatchingAnswerContent value={userVal} />
                            {!reviewMode && (
                              <button onClick={() => { const next = { ...responses }; delete next[pair.left]; onChange(next); }} className="absolute -top-2 -right-2 p-1 bg-white border rounded-full shadow-lg hover:text-rose-500">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center px-2">
                            {reviewMode ? "NO SUBMISSION" : "Drop Module"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {reviewMode && !isCorrect && (
                    <div className="mx-6 p-4 bg-emerald-50/50 rounded-b-2xl border-x border-b border-emerald-200 border-dashed flex items-center justify-between animate-in slide-in-from-top-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Correct Registry:</span>
                      </div>
                      <MatchingAnswerContent value={pair.right} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!reviewMode && (
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-8 bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 min-h-[400px]">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-8 text-center">Unallocated Pool</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {availableAnswers.map((ans, i) => (
                  <div 
                    key={i} 
                    draggable 
                    onDragStart={(e) => (e.dataTransfer.setData("text/plain", ans), setDraggingItem(ans))} 
                    onDragEnd={() => setDraggingItem(null)} 
                    className={cn(
                      "p-3 bg-white border-2 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-xl transition-all",
                      draggingItem === ans && "opacity-20 grayscale"
                    )}
                  >
                    <MatchingAnswerContent value={ans} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
