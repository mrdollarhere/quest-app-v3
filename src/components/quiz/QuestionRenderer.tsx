
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Question, HotspotZone } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  CheckCircle2, 
  Link2, 
  XCircle, 
  GripVertical, 
  Info, 
  Check, 
  X, 
  RotateCcw, 
  Trash2,
  Table as TableIcon,
  AlertCircle,
  ImageIcon,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRegistryArray } from '@/lib/quiz-utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

/**
 * Fisher-Yates shuffle algorithm for stable randomization.
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const QuestionRenderer: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [hasImageError, setHasImageError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Randomize standard options (Choices, Dropdown, Matrix Columns)
  const options = useMemo(() => {
    const rawOptions = parseRegistryArray(question.options);
    return reviewMode ? rawOptions : shuffleArray(rawOptions);
  }, [question.id, question.options, reviewMode]);

  // Randomize rows/statements (MTF, Matrix Rows)
  const shuffledRows = useMemo(() => {
    const rawRows = parseRegistryArray(question.order_group);
    return reviewMode ? rawRows : shuffleArray(rawRows);
  }, [question.id, question.order_group, reviewMode]);

  const matchingPairs = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    const pairsArr = parseRegistryArray(question.order_group);
    return pairsArr.map(p => {
      const [left, right] = p.split('|');
      return { left: (left || "").trim(), right: (right || "").trim() };
    });
  }, [question.order_group, question.question_type]);

  const shuffledItemsPool = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    return shuffleArray(matchingPairs.map(p => p.right));
  }, [matchingPairs, question.question_type]);

  const initialShuffledOrder = useMemo(() => {
    if (question.question_type !== 'ordering') return [];
    return shuffleArray(parseRegistryArray(question.order_group));
  }, [question.id, question.order_group, question.question_type]);

  useEffect(() => {
    // Ensure we don't pass an empty string to src to avoid Next.js hydration warnings
    setImgSrc(question.image_url && question.image_url.trim() !== "" ? question.image_url : undefined);
    setHasImageError(false);
  }, [question.id, question.image_url]);

  const handleImageError = () => {
    setImgSrc('https://picsum.photos/seed/dntrng-placeholder/800/450');
    setHasImageError(true);
  };

  const renderSingleChoice = () => (
    <RadioGroup 
      value={value || ""} 
      onValueChange={onChange}
      disabled={reviewMode}
      className="space-y-3"
    >
      {options.map((option, idx) => (
        <div key={idx} className={cn(
          "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all",
          value === option ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted border-transparent bg-muted/30'
        )}>
          <RadioGroupItem value={option} id={`q-${question.id}-${idx}`} />
          <Label htmlFor={`q-${question.id}-${idx}`} className="flex-1 cursor-pointer font-medium text-lg">{option}</Label>
          {reviewMode && option === parseRegistryArray(question.correct_answer)[0] && <CheckCircle2 className="w-6 h-6 text-green-500" />}
        </div>
      ))}
    </RadioGroup>
  );

  const renderMultipleChoice = () => {
    const selected = (value as string[]) || [];
    const toggle = (opt: string) => {
      if (reviewMode) return;
      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
      onChange(next);
    };

    const correctArr = parseRegistryArray(question.correct_answer);

    return (
      <div className="space-y-3">
        {options.map((option, idx) => (
          <div key={idx} className={cn(
            "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all",
            selected.includes(option) ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted border-transparent bg-muted/30'
          )}>
            <Checkbox 
              id={`q-${question.id}-${idx}`} 
              checked={selected.includes(option)} 
              onCheckedChange={() => toggle(option)}
              disabled={reviewMode}
            />
            <Label htmlFor={`q-${question.id}-${idx}`} className="flex-1 cursor-pointer font-medium text-lg">{option}</Label>
            {reviewMode && correctArr.includes(option) && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>
        ))}
      </div>
    );
  };

  const renderRating = () => {
    const ratingValue = parseInt(value || "0");
    const max = 5;
    return (
      <div className="flex items-center justify-center space-x-2 py-8">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={reviewMode}
            onClick={() => onChange((i + 1).toString())}
            className={cn("p-2 transition-transform hover:scale-125", reviewMode ? 'cursor-default' : 'cursor-pointer')}
          >
            <Star 
              className={cn("w-12 h-12 transition-colors", i < ratingValue ? 'fill-accent text-accent' : 'text-slate-200')} 
            />
          </button>
        ))}
      </div>
    );
  };

  const renderOrdering = () => {
    const currentOrder = (value as string[]) || initialShuffledOrder;
    const correctOrder = parseRegistryArray(question.correct_answer);

    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index || reviewMode) return;
      
      const newOrder = [...currentOrder];
      const itemToMove = newOrder.splice(draggedItemIndex, 1)[0];
      newOrder.splice(index, 0, itemToMove);
      
      setDraggedItemIndex(index);
      onChange(newOrder);
    };

    if (!reviewMode && currentOrder.length === 0 && parseRegistryArray(question.order_group).length > 0) {
      return <div className="h-40 flex items-center justify-center text-slate-300 font-bold animate-pulse">Initializing Sequence...</div>;
    }

    return (
      <div className="space-y-4">
        {!reviewMode && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-medium text-primary">
              <Info className="w-4 h-4" />
              <span>Drag items to reorder them into the correct sequence.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange(initialShuffledOrder)} className="rounded-full gap-2">
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
                  reviewMode && isCorrectPos && "border-green-500 bg-green-50/50",
                  reviewMode && !isCorrectPos && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 font-black text-slate-400 text-sm shrink-0 border border-slate-100">
                  {idx + 1}
                </div>
                <div className="flex-1 font-bold text-slate-700 text-lg">{item}</div>
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

  const renderMatching = () => {
    const responses = (value as Record<string, string>) || {};
    const prompts = matchingPairs.map(p => p.left);
    const assignedAnswers = Object.values(responses);
    const availableAnswers = shuffledItemsPool.filter(ans => !assignedAnswers.includes(ans));

    const handleDrop = (prompt: string, answer: string) => {
      if (reviewMode) return;
      onChange({ ...responses, [prompt]: answer });
    };

    const handleClear = (prompt: string) => {
      if (reviewMode) return;
      const newResponses = { ...responses };
      delete newResponses[prompt];
      onChange(newResponses);
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {!reviewMode && (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <p className="text-xs font-medium text-primary">Drag answers from the pool into the correct target slots.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Protocol Targets</h3>
            <div className="space-y-3">
              {prompts.map((prompt, i) => {
                const userVal = responses[prompt];
                const pair = matchingPairs.find(p => p.left === prompt);
                const correctAnswer = pair?.right;
                const isCorrect = reviewMode && userVal === correctAnswer;

                return (
                  <div key={i} className="space-y-2">
                    <div className={cn(
                      "p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-6",
                      reviewMode 
                        ? (isCorrect ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100") 
                        : "bg-slate-50/50 border-slate-100"
                    )}>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Prompt</span>
                        <p className="font-bold text-slate-700 truncate text-lg">{prompt}</p>
                      </div>

                      <div 
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-4', 'ring-primary/20', 'border-primary'); }}
                        onDragLeave={(e) => { e.currentTarget.classList.remove('ring-4', 'ring-primary/20', 'border-primary'); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('ring-4', 'ring-primary/20', 'border-primary');
                          const data = e.dataTransfer.getData("text/plain");
                          if (data) handleDrop(prompt, data);
                        }}
                        className={cn(
                          "w-48 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all px-4 relative group",
                          userVal ? "border-primary bg-white shadow-xl" : "border-slate-300 bg-white/50"
                        )}
                      >
                        {userVal ? (
                          <>
                            <span className="font-black text-xs text-primary truncate pr-6">{userVal}</span>
                            {!reviewMode && (
                              <button 
                                onClick={() => handleClear(prompt)}
                                className="absolute right-3 p-1 hover:bg-slate-100 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3 text-slate-400" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Drop Module</span>
                        )}
                      </div>
                    </div>
                    {reviewMode && !isCorrect && (
                      <div className="px-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Correct Registry: {correctAnswer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!reviewMode && (
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Answer Pool</h3>
                <div className="p-8 bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-slate-200 min-h-[400px] flex flex-wrap gap-3 items-start content-start">
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
                        "px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all font-black text-sm text-slate-600",
                        draggingItem === ans && "opacity-20 scale-95 grayscale"
                      )}
                    >
                      {ans}
                    </div>
                  ))}
                  {availableAnswers.length === 0 && (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-slate-300 text-center gap-4">
                      <CheckCircle2 className="w-12 h-12 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Registry Fully Allocated</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMultipleTrueFalse = () => {
    const statements = shuffledRows;
    const correctAnswersArr = parseRegistryArray(question.correct_answer);
    const originalStatements = parseRegistryArray(question.order_group);
    const responses = (value as Record<string, string>) || {};

    const handleUpdate = (statement: string, val: string) => {
      if (reviewMode) return;
      onChange({ ...responses, [statement]: val });
    };

    return (
      <div className="space-y-6">
        {statements.map((s, i) => {
          const userVal = responses[s];
          const originalIdx = originalStatements.indexOf(s);
          const isCorrect = reviewMode && userVal === correctAnswersArr[originalIdx];
          
          return (
            <div key={i} className={cn(
              "p-6 rounded-[2rem] border-2 transition-all",
              reviewMode ? (isCorrect ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100") : "bg-white border-slate-100 shadow-sm"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <p className="font-bold text-lg text-slate-700 flex-1">{s}</p>
                <div className="flex gap-3 shrink-0">
                  {['True', 'False'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleUpdate(s, opt)}
                      disabled={reviewMode}
                      className={cn(
                        "h-12 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all",
                        userVal === opt 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {reviewMode && !isCorrect && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Correct: {correctAnswersArr[originalIdx]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMatrixChoice = () => {
    const rows = shuffledRows;
    const columns = options;
    const correctAnswersArr = parseRegistryArray(question.correct_answer);
    const originalRows = parseRegistryArray(question.order_group);
    const responses = (value as Record<string, string>) || {};

    const handleUpdate = (row: string, col: string) => {
      if (reviewMode) return;
      onChange({ ...responses, [row]: col });
    };

    return (
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="text-left px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em]">Parameter</th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-4 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em] text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const userVal = responses[row];
              const originalIdx = originalRows.indexOf(row);
              const isCorrectRow = reviewMode && userVal === correctAnswersArr[originalIdx];

              return (
                <tr key={i} className={cn(
                  "group transition-all",
                  reviewMode ? (isCorrectRow ? "opacity-100" : "opacity-80") : ""
                )}>
                  <td className={cn(
                    "p-6 rounded-l-[2rem] border-y-2 border-l-2 font-bold text-slate-700",
                    reviewMode && !isCorrectRow ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"
                  )}>
                    {row}
                  </td>
                  {columns.map((col, j) => (
                    <td 
                      key={j} 
                      className={cn(
                        "p-4 border-y-2 text-center transition-all cursor-pointer last:border-r-2 last:rounded-r-[2rem]",
                        userVal === col ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100",
                        reviewMode && userVal === col && col === correctAnswersArr[originalIdx] && "bg-green-50 border-green-200",
                        reviewMode && userVal === col && col !== correctAnswersArr[originalIdx] && "bg-red-50 border-red-200"
                      )}
                      onClick={() => handleUpdate(row, col)}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center transition-all",
                        userVal === col 
                          ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                          : "bg-white border-slate-200 group-hover:border-primary/40"
                      )}>
                        {userVal === col && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHotspot = () => {
    const coords = (value as { x: number; y: number } | null);
    const zones: HotspotZone[] = JSON.parse(question.metadata || "[]");

    return (
      <div className="space-y-4">
        <div 
          className="hotspot-container relative w-full aspect-video border-4 border-white rounded-[2rem] overflow-hidden cursor-crosshair shadow-2xl bg-muted"
          onClick={(e) => {
            if (reviewMode) return;
            const rect = e.currentTarget.getBoundingClientRect();
            onChange({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
          }}
        >
          {imgSrc && (
            <img 
              src={imgSrc} 
              alt="Question" 
              className="w-full h-full object-cover select-none" 
              draggable={false} 
              onError={handleImageError}
            />
          )}
          {coords && (
            <div className="absolute w-10 h-10 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-2xl ring-8 bg-primary/80 ring-primary/10" style={{ left: `${coords.x}%`, top: `${coords.y}%` }} />
          )}
          {reviewMode && zones.map((z: HotspotZone) => (
            <div key={z.id} className={cn("absolute border-4 border-dashed rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center", z.isCorrect ? "border-green-500 bg-green-500/10" : "border-slate-400 bg-slate-400/10")} style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.radius * 2}%`, height: `${z.radius * 2}%` }}>
              <span className={cn("text-[10px] font-black text-white px-2 py-0.5 rounded-full border shadow-md", z.isCorrect ? "bg-green-600 border-green-400" : "bg-slate-600 border-slate-400")}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDefault = () => {
    const correctArr = parseRegistryArray(question.correct_answer);
    switch(question.question_type) {
      case 'short_text':
        return (
          <div className="space-y-4">
            <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Answer..." disabled={reviewMode} className="h-16 text-xl font-bold border-2 rounded-2xl px-6" />
            {reviewMode && <div className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 font-bold text-green-900">Correct: {correctArr[0]}</div>}
          </div>
        );
      case 'dropdown':
        return (
          <div className="space-y-4">
            <Select onValueChange={onChange} value={value} disabled={reviewMode}>
              <SelectTrigger className="h-16 text-xl font-bold border-2 rounded-2xl px-6">
                <SelectValue placeholder="Choose..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {options.map((o, i) => <SelectItem key={i} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            {reviewMode && <div className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 font-bold text-green-900">Correct: {correctArr[0]}</div>}
          </div>
        );
      case 'true_false':
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={reviewMode} className="flex flex-col space-y-4">
             {['True', 'False'].map((o) => (
               <div key={o} className={cn("flex items-center space-x-3 p-6 rounded-[2rem] border-2 transition-all", value === o ? 'bg-primary/5 border-primary shadow-lg' : 'bg-slate-50/50')}>
                <RadioGroupItem value={o} id={`tf-${question.id}-${o}`} className="w-6 h-6" />
                <Label htmlFor={`tf-${question.id}-${o}`} className="flex-1 cursor-pointer font-black text-2xl">{o}</Label>
                {reviewMode && o === correctArr[0] && <CheckCircle2 className="w-8 h-8 text-green-600" />}
              </div>
             ))}
          </RadioGroup>
        );
      default: return null;
    }
  }

  const renderContent = () => {
    switch (question.question_type) {
      case 'single_choice': return renderSingleChoice();
      case 'multiple_choice': return renderMultipleChoice();
      case 'rating': return renderRating();
      case 'ordering': return renderOrdering();
      case 'matching': return renderMatching();
      case 'hotspot': return renderHotspot();
      case 'multiple_true_false': return renderMultipleTrueFalse();
      case 'matrix_choice': return renderMatrixChoice();
      default: return renderDefault();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black leading-[1.15] text-foreground tracking-tighter w-full">
          {question.question_text}
          {question.required && <span className="text-destructive ml-2">*</span>}
        </h2>
        <div className="h-1.5 w-20 bg-primary/10 rounded-full mt-6" />
      </div>

      {/* Global Visual Asset Rendering */}
      {!!imgSrc && question.question_type !== 'hotspot' && (
        <>
          <div 
            className="mb-10 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative group cursor-zoom-in"
            onClick={() => setIsZoomOpen(true)}
          >
            <img 
              src={imgSrc} 
              alt="Step Asset" 
              className="w-full h-auto object-cover max-h-[450px] transition-transform duration-700 group-hover:scale-[1.02]"
              onError={handleImageError}
            />
            {hasImageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm text-slate-400">
                <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Media Sync Failed • Placeholder Active</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
                <Maximize2 className="w-6 h-6 text-slate-900" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">Visual Context Protocol</span>
            </div>
          </div>

          <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                  src={imgSrc} 
                  alt="Zoomed Asset" 
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                />
                <DialogTitle className="sr-only">Image Perspective View</DialogTitle>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <div className="space-y-10">{renderContent()}</div>
    </div>
  );
};
