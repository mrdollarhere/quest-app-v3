
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Question, QuestionType } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ArrowUp, ArrowDown, CheckCircle2, Link2, XCircle, GripVertical, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const QuestionRenderer: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  // --- TOP LEVEL HOOKS (Must always be called in the same order) ---
  
  // 1. General Options
  const options = useMemo(() => 
    question.options ? question.options.split(',').map(o => o.trim()) : [], 
    [question.options]
  );

  // 2. Matching logic setup
  const matchingPairs = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    return question.order_group?.split(',').map(p => {
      const [left, right] = p.split('|');
      return { left: (left || "").trim(), right: (right || "").trim() };
    }) || [];
  }, [question.order_group, question.question_type]);

  const leftItems = useMemo(() => matchingPairs.map(p => p.left), [matchingPairs]);
  
  // 3. Randomization state (to avoid hydration mismatch)
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([]);
  useEffect(() => {
    if (question.question_type === 'matching') {
      const pool = matchingPairs.map(p => p.right).sort(() => 0.5 - Math.random());
      setShuffledRightItems(pool);
    }
  }, [matchingPairs, question.question_type]);

  // 4. Interactive states
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedPoolItem, setSelectedPoolItem] = useState<string | null>(null);

  // 5. Correct answers for matching
  const correctMatchingPairs = useMemo(() => {
    if (question.question_type !== 'matching') return [];
    return question.correct_answer?.split(',').map(p => {
      const [l, r] = p.split('|');
      return { l: (l || "").trim(), r: (r || "").trim() };
    }) || [];
  }, [question.correct_answer, question.question_type]);

  // --- DERIVED DATA ---
  const matches = (value as Record<string, string>) || {};

  // --- INTERACTION HANDLERS ---
  const handleMatchingDrop = (prompt: string, answer: string) => {
    if (reviewMode) return;
    const newMatches = { ...matches };
    newMatches[prompt] = answer;
    onChange(newMatches);
    setDraggedItem(null);
    setSelectedPoolItem(null);
  };

  const clearMatchingMatch = (prompt: string) => {
    if (reviewMode) return;
    const newMatches = { ...matches };
    delete newMatches[prompt];
    onChange(newMatches);
  };

  const isMatchingAnswerUsed = (answer: string) => Object.values(matches).includes(answer);

  // --- RENDER FUNCTIONS ---
  const renderSingleChoice = () => (
    <RadioGroup 
      value={value || ""} 
      onValueChange={onChange}
      disabled={reviewMode}
      className="space-y-3"
    >
      {options.map((option, idx) => (
        <div key={idx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${value === option ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}>
          <RadioGroupItem value={option} id={`q-${question.id}-${idx}`} />
          <Label htmlFor={`q-${question.id}-${idx}`} className="flex-1 cursor-pointer">{option}</Label>
          {reviewMode && option === question.correct_answer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
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
          <div key={idx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${selected.includes(option) ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}>
            <Checkbox 
              id={`q-${question.id}-${idx}`} 
              checked={selected.includes(option)} 
              onCheckedChange={() => toggle(option)}
              disabled={reviewMode}
            />
            <Label htmlFor={`q-${question.id}-${idx}`} className="flex-1 cursor-pointer">{option}</Label>
            {reviewMode && question.correct_answer?.split(',').map(c => c.trim()).includes(option) && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
        ))}
      </div>
    );
  };

  const renderRating = () => {
    const ratingValue = parseInt(value || "0");
    const max = 5;
    return (
      <div className="flex items-center justify-center space-x-2 py-4">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={reviewMode}
            onClick={() => onChange((i + 1).toString())}
            className={`p-2 transition-transform hover:scale-110 ${reviewMode ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star 
              className={`w-10 h-10 ${i < ratingValue ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const renderOrdering = () => {
    const items = (value as string[]) || question.order_group?.split(',').map(i => i.trim()) || [];
    const correctOrder = question.correct_answer?.split(',').map(i => i.trim()) || [];

    const move = (index: number, direction: 'up' | 'down') => {
      if (reviewMode) return;
      const next = [...items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      onChange(next);
    };

    return (
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isCorrectPos = reviewMode && item === correctOrder[idx];
          return (
            <div key={idx} className={`flex items-center space-x-3 p-3 rounded-lg border bg-card ${reviewMode ? (isCorrectPos ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-border'}`}>
              <div className="flex flex-col space-y-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(idx, 'up')} disabled={idx === 0 || reviewMode}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(idx, 'down')} disabled={idx === items.length - 1 || reviewMode}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
              <span className="font-medium text-lg min-w-[1.5rem]">{idx + 1}.</span>
              <span className="flex-1">{item}</span>
              {reviewMode && !isCorrectPos && (
                <span className="text-xs font-bold text-red-600">Correct: {correctOrder[idx]}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMatching = () => {
    return (
      <div className="space-y-8">
        {!reviewMode && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-medium text-primary mb-4">
            <Info className="w-4 h-4" />
            <span>Drag answers to center zones or tap to select and place.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            {leftItems.map((prompt, idx) => {
              const currentMatch = matches[prompt];
              const isCorrect = reviewMode && currentMatch && correctMatchingPairs.find(cp => cp.l === prompt)?.r === currentMatch;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 group">
                  <div className="w-full sm:w-1/2 p-4 bg-slate-50 border rounded-xl font-semibold text-slate-700 shadow-sm min-h-[60px] flex items-center">
                    {prompt}
                  </div>

                  <div 
                    className={cn(
                      "w-full sm:w-1/2 min-h-[60px] rounded-xl border-2 transition-all flex items-center justify-center p-2 relative overflow-hidden",
                      !currentMatch && !reviewMode && "border-dashed border-slate-300 bg-slate-50/50 hover:border-primary/50 hover:bg-primary/5",
                      !currentMatch && selectedPoolItem && !reviewMode && "border-primary border-solid animate-pulse bg-primary/10",
                      currentMatch && "border-solid border-slate-200 bg-white shadow-sm",
                      reviewMode && isCorrect && "border-green-500 bg-green-50",
                      reviewMode && currentMatch && !isCorrect && "border-destructive bg-destructive/5"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!reviewMode) e.currentTarget.classList.add('bg-primary/10', 'border-primary');
                    }}
                    onDragLeave={(e) => {
                      if (!reviewMode) e.currentTarget.classList.remove('bg-primary/10', 'border-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const answer = e.dataTransfer.getData("text/plain");
                      handleMatchingDrop(prompt, answer);
                    }}
                    onClick={() => {
                      if (selectedPoolItem) handleMatchingDrop(prompt, selectedPoolItem);
                    }}
                  >
                    {currentMatch ? (
                      <div className="flex items-center justify-between w-full px-2">
                        <span className="font-medium text-primary">{currentMatch}</span>
                        {!reviewMode && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); clearMatchingMatch(prompt); }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {reviewMode && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 ml-2" />}
                        {reviewMode && !isCorrect && <XCircle className="w-5 h-5 text-destructive ml-2" />}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                        {reviewMode ? "Unmatched" : (selectedPoolItem ? "Tap to place" : "Drop answer here")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Answer Pool</h3>
            <div className="flex flex-wrap lg:flex-col gap-3">
              {shuffledRightItems.map((answer, idx) => {
                const used = isMatchingAnswerUsed(answer);
                const isSelected = selectedPoolItem === answer;

                return (
                  <div
                    key={idx}
                    draggable={!used && !reviewMode}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", answer);
                      setDraggedItem(answer);
                    }}
                    onClick={() => {
                      if (!used && !reviewMode) {
                        setSelectedPoolItem(isSelected ? null : answer);
                      }
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 font-medium text-sm transition-all cursor-grab active:cursor-grabbing shadow-sm",
                      used ? "opacity-30 bg-slate-100 border-transparent cursor-not-allowed" : "bg-white border-slate-200 hover:border-primary/50 hover:shadow-md",
                      isSelected && "border-primary bg-primary/5 ring-4 ring-primary/10",
                      reviewMode && "cursor-default pointer-events-none"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3 h-3 text-slate-300" />
                      {answer}
                    </div>
                  </div>
                );
              })}
            </div>
            {!reviewMode && (
              <Button 
                variant="ghost" 
                className="w-full mt-6 text-xs font-bold text-muted-foreground hover:text-destructive"
                onClick={() => onChange({})}
              >
                Clear All Matches
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHotspot = () => {
    const coords = (value as { x: number; y: number } | null);
    const zones: any[] = JSON.parse(question.metadata || "[]");

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (reviewMode) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onChange({ x, y });
    };

    return (
      <div className="space-y-4">
        <div 
          className="hotspot-container relative w-full aspect-video border-2 rounded-2xl overflow-hidden cursor-crosshair shadow-xl bg-muted"
          onClick={handleClick}
        >
          {question.image_url ? (
            <img 
              src={question.image_url} 
              alt="Question Visual" 
              className="w-full h-full object-cover select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground">
              <Link2 className="w-12 h-12 mb-2 opacity-20" />
              <span>Visual reference missing</span>
            </div>
          )}
          
          {coords && (
            <div 
              className="absolute w-8 h-8 border-4 border-white bg-primary/70 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-2xl ring-4 ring-primary/20 animate-in zoom-in-50"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          )}

          {reviewMode && zones.map((z: any) => (
            <div 
              key={z.id}
              className="absolute border-2 border-dashed border-green-500 bg-green-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden"
              style={{ 
                left: `${z.x}%`, 
                top: `${z.y}%`, 
                width: `${z.radius * 2}%`, 
                height: `${z.radius * 2}%` 
              }}
            >
              <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded-full shadow-sm">{z.label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-center text-muted-foreground italic">Click the image to mark your answer</p>
      </div>
    );
  };

  const renderDefault = () => {
    switch(question.question_type) {
      case 'short_text':
        return (
          <div className="space-y-3">
            <Input 
              value={value || ""} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder="Type your answer here..."
              disabled={reviewMode}
              className="h-14 text-lg border-2 focus-visible:ring-primary/20"
            />
            {reviewMode && <div className="text-sm p-3 bg-green-50 rounded-lg border border-green-100">Correct: <span className="font-bold text-green-700">{question.correct_answer}</span></div>}
          </div>
        );
      case 'dropdown':
        return (
          <div className="space-y-3">
            <Select onValueChange={onChange} value={value} disabled={reviewMode}>
              <SelectTrigger className="h-14 text-lg border-2">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o, i) => (
                  <SelectItem key={i} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reviewMode && <div className="text-sm p-3 bg-green-50 rounded-lg border border-green-100">Correct: <span className="font-bold text-green-700">{question.correct_answer}</span></div>}
          </div>
        );
      case 'true_false':
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={reviewMode} className="flex flex-col space-y-3">
             {['True', 'False'].map((o) => (
               <div key={o} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${value === o ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted'}`}>
                <RadioGroupItem value={o} id={`tf-${question.id}-${o}`} />
                <Label htmlFor={`tf-${question.id}-${o}`} className="flex-1 cursor-pointer font-semibold text-lg">{o}</Label>
                {reviewMode && o === question.correct_answer && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              </div>
             ))}
          </RadioGroup>
        );
      default:
        return <div className="p-8 border-2 border-dashed rounded-2xl text-center text-muted-foreground bg-muted/20">Question type "{question.question_type}" implementation coming soon.</div>;
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
      default: return renderDefault();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground tracking-tight">
          {question.question_text}
          {question.required && <span className="text-destructive ml-1.5">*</span>}
        </h2>
      </div>
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};
