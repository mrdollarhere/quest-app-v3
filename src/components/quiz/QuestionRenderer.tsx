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
  Table as TableIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const QuestionRenderer: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const options = useMemo(() => 
    question.options ? question.options.split(',').map(o => o.trim()) : [], 
    [question.options]
  );

  const matchingPairs = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    return question.order_group?.split(',').map(p => {
      const [left, right] = p.split('|');
      return { left: (left || "").trim(), right: (right || "").trim() };
    }) || [];
  }, [question.order_group, question.question_type]);

  const leftItems = useMemo(() => matchingPairs.map(p => p.left), [matchingPairs]);
  
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([]);
  useEffect(() => {
    if (['matching', 'ordering'].includes(question.question_type)) {
      const pool = matchingPairs.length > 0 
        ? matchingPairs.map(p => p.right).sort(() => 0.5 - Math.random())
        : (question.order_group?.split(',').map(i => i.trim()) || []).sort(() => 0.5 - Math.random());
      setShuffledRightItems(pool);
    }
  }, [matchingPairs, question.order_group, question.question_type]);

  const initialOrderItems = useMemo(() => 
    question.order_group?.split(',').map(i => i.trim()) || [],
    [question.order_group]
  );

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [selectedPoolItem, setSelectedPoolItem] = useState<string | null>(null);

  const correctMatchingPairs = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    return question.correct_answer?.split(',').map(p => {
      const [l, r] = p.split('|');
      return { l: (l || "").trim(), r: (r || "").trim() };
    }) || [];
  }, [question.correct_answer, question.question_type]);

  const matches = (value as Record<string, string>) || {};
  const currentOrder = (value as string[]) || initialOrderItems;

  const handleMatchingDrop = (prompt: string, answer: string) => {
    if (reviewMode) return;
    const newMatches = { ...matches };
    newMatches[prompt] = answer;
    onChange(newMatches);
    setSelectedPoolItem(null);
  };

  const isMatchingAnswerUsed = (answer: string) => Object.values(matches).includes(answer);

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
          {reviewMode && option === question.correct_answer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
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
            {reviewMode && question.correct_answer?.split(',').map(c => c.trim()).includes(option) && <CheckCircle2 className="w-6 h-6 text-green-500" />}
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
    const correctOrder = question.correct_answer?.split(',').map(i => i.trim()) || [];

    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index || reviewMode) return;
      
      const newOrder = [...currentOrder];
      const itemToMove = newOrder.splice(draggedItemIndex, 1)[0];
      newOrder.splice(index, 0, itemToMove);
      
      setDraggedItemIndex(index);
      onChange(newOrder);
    };

    return (
      <div className="space-y-4">
        {!reviewMode && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-medium text-primary">
              <Info className="w-4 h-4" />
              <span>Drag items to reorder them into the correct sequence.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange(initialOrderItems)} className="rounded-full gap-2">
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

  const renderMultipleTrueFalse = () => {
    const statements = question.order_group?.split(',').map(s => s.trim()) || [];
    const correctAnswers = question.correct_answer?.split(',').map(c => c.trim()) || [];
    const responses = (value as Record<string, string>) || {};

    const handleUpdate = (statement: string, val: string) => {
      if (reviewMode) return;
      onChange({ ...responses, [statement]: val });
    };

    return (
      <div className="space-y-6">
        {statements.map((s, i) => {
          const userVal = responses[s];
          const isCorrect = reviewMode && userVal === correctAnswers[i];
          
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
                  <CheckCircle2 className="w-3 h-3" /> Correct: {correctAnswers[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMatrixChoice = () => {
    const rows = question.order_group?.split(',').map(r => r.trim()) || [];
    const columns = options;
    const correctAnswers = question.correct_answer?.split(',').map(c => c.trim()) || [];
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
              const isCorrectRow = reviewMode && userVal === correctAnswers[i];

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
                        reviewMode && userVal === col && col === correctAnswers[i] && "bg-green-50 border-green-200",
                        reviewMode && userVal === col && col !== correctAnswers[i] && "bg-red-50 border-red-200"
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
          <img src={question.image_url} alt="Question" className="w-full h-full object-cover select-none" draggable={false} />
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
    switch(question.question_type) {
      case 'short_text':
        return (
          <div className="space-y-4">
            <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Answer..." disabled={reviewMode} className="h-16 text-xl font-bold border-2 rounded-2xl px-6" />
            {reviewMode && <div className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 font-bold text-green-900">Correct: {question.correct_answer}</div>}
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
            {reviewMode && <div className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 font-bold text-green-900">Correct: {question.correct_answer}</div>}
          </div>
        );
      case 'true_false':
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={reviewMode} className="flex flex-col space-y-4">
             {['True', 'False'].map((o) => (
               <div key={o} className={cn("flex items-center space-x-3 p-6 rounded-[2rem] border-2 transition-all", value === o ? 'bg-primary/5 border-primary shadow-lg' : 'bg-slate-50/50')}>
                <RadioGroupItem value={o} id={`tf-${question.id}-${o}`} className="w-6 h-6" />
                <Label htmlFor={`tf-${question.id}-${o}`} className="flex-1 cursor-pointer font-black text-2xl">{o}</Label>
                {reviewMode && o === question.correct_answer && <CheckCircle2 className="w-8 h-8 text-green-600" />}
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
        <h2 className="text-3xl md:text-4xl font-black leading-[1.15] text-foreground tracking-tighter max-w-2xl">
          {question.question_text}
          {question.required && <span className="text-destructive ml-2">*</span>}
        </h2>
        <div className="h-1.5 w-20 bg-primary/10 rounded-full mt-6" />
      </div>
      <div className="space-y-10">{renderContent()}</div>
    </div>
  );
};
