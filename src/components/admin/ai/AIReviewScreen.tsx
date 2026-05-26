"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, RotateCcw, CheckCircle2, ChevronDown, Edit3, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AIReviewScreenProps {
  questions: any[];
  onSave: (questions: any[]) => void;
  onRegenerate: () => void;
}

export function AIReviewScreen({ questions: initialQuestions, onSave, onRegenerate }: AIReviewScreenProps) {
  const [items, setItems] = useState(initialQuestions);

  const toggleSelect = (id: string) => {
    setItems(prev => prev.map(item => item.tempId === id ? { ...item, selected: !item.selected } : item));
  };

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h4 className="text-2xl font-black uppercase text-slate-900">Intelligence Audit</h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedCount} of {items.length} nodes ready for registry</p>
        </div>
        <Button variant="outline" onClick={onRegenerate} className="rounded-full h-11 border-2 font-black uppercase text-[10px] tracking-widest">
          <RotateCcw className="w-3.5 h-3.5 mr-2" /> Adjust Logic
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((q, idx) => (
          <div key={q.tempId} className={cn(
            "rounded-[2rem] border-2 transition-all overflow-hidden",
            q.selected ? "border-violet-100 bg-white" : "border-slate-100 bg-slate-50/50 opacity-60"
          )}>
            <div className="flex items-center gap-6 p-6 border-b border-slate-50">
              <Checkbox checked={q.selected} onCheckedChange={() => toggleSelect(q.tempId)} className="h-6 w-6 rounded-lg" />
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-300">#{(idx + 1).toString().padStart(2, '0')}</span>
                  <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[9px] uppercase tracking-widest">
                    {q.question_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="font-black text-[9px] uppercase border-slate-200 text-slate-400">
                    {q.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Question Prompt</p>
                <p className="font-bold text-slate-900 leading-relaxed">{q.question_text}</p>
              </div>

              {q.options?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Option Matrix</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt: string, i: number) => {
                      const isCorrect = q.correct_answer.includes(opt);
                      return (
                        <div key={i} className={cn(
                          "p-4 rounded-xl border-2 text-xs font-bold",
                          isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 text-slate-500"
                        )}>
                          {opt} {isCorrect && "✓"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Internal Explanation</p>
                 <p className="text-sm font-medium text-slate-500 italic leading-relaxed">"{q.explanation}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 -mx-8 -mb-8 p-8 flex justify-center shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <Button 
          onClick={() => onSave(items.filter(i => i.selected))} 
          disabled={selectedCount === 0}
          className="h-16 px-16 rounded-full bg-primary text-white font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] border-none"
        >
          <Save className="w-6 h-6 mr-3" /> Commit Selected Nodes
        </Button>
      </div>
    </div>
  );
}
