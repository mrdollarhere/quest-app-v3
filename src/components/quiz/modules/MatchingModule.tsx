"use client";

import React, { useState, useMemo } from 'react';
import { Question } from '@/types/quiz';
import { Info, X, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
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
  
  // Bug 1 Fix: Ensure value is treated as a Record for highlighting
  const responses = useMemo(() => (value as Record<string, string>) || {}, [value]);
  
  const assignedAnswers = Object.values(responses);
  const availableAnswers = shuffledPool.filter(ans => !assignedAnswers.includes(ans));

  const hasAnyResponse = Object.keys(responses).length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Registry Targets</h3>
          <div className="space-y-3">
            {matchingPairs.map((pair, i) => {
              const userVal = responses[pair.left];
              const isCorrect = reviewMode && String(userVal || "").trim().toLowerCase() === String(pair.right).trim().toLowerCase();

              return (
                <div key={i} className="space-y-2">
                  <div className={cn("p-4 rounded-[1.5rem] border-2 transition-all grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center", reviewMode ? (isCorrect ? "bg-emerald-50 border-emerald-200" : (userVal ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100")) : "bg-white border-slate-100")}>
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Key Node</span>
                      <p className="option-text font-bold text-slate-700 text-base">{pair.left}</p>
                    </div>

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
                      className={cn("w-full sm:w-[150px] min-h-[100px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all p-2 relative", userVal ? "border-primary bg-white shadow-sm" : "border-slate-300 bg-slate-50")}
                    >
                      {userVal ? (
                        <div className="flex flex-col items-center gap-2">
                          <MatchingAnswerContent value={userVal} />
                          {!reviewMode && <button onClick={() => { const next = { ...responses }; delete next[pair.left]; onChange(next); }} className="absolute -top-2 -right-2 p-1 bg-white border rounded-full shadow-lg hover:text-rose-500"><X className="w-3 h-3" /></button>}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {/* Bug 4 Fix: Context-aware label */}
                          {reviewMode ? "NO ANSWER SUBMITTED" : "Empty"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {reviewMode && !isCorrect && (
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 flex items-center gap-6 animate-in slide-in-from-top-1">
                      <div className="flex flex-col flex-1">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Target Mapping</span>
                        <p className="text-xs font-bold text-emerald-800">{pair.left}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-300" />
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
            <div className="sticky top-24 p-6 bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 min-h-[300px]">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Unallocated Pool</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableAnswers.map((ans, i) => (
                  <div key={i} draggable onDragStart={(e) => (e.dataTransfer.setData("text/plain", ans), setDraggingItem(ans))} onDragEnd={() => setDraggingItem(null)} className={cn("p-2 bg-white border rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-all", draggingItem === ans && "opacity-20 grayscale")}>
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