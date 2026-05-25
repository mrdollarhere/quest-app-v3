"use client";

import React, { useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";
import { Question } from '@/types/quiz';

interface ExportQuestionSelectorProps {
  questions: Question[];
  selectionType: 'all' | 'random';
  setSelectionType: (val: 'all' | 'random') => void;
  randomCount: number;
  setRandomCount: (val: number) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (val: string[]) => void;
}

export function ExportQuestionSelector({ 
  questions, 
  selectionType, 
  setSelectionType, 
  randomCount, 
  setRandomCount,
  selectedDifficulties,
  setSelectedDifficulties
}: ExportQuestionSelectorProps) {
  const hasDifficultyMetadata = useMemo(() => 
    questions.some(q => (q as any).difficulty), 
  [questions]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    questions.forEach(q => {
      const d = (q as any).difficulty || 'Medium';
      if (counts[d] !== undefined) counts[d]++;
    });
    return counts;
  }, [questions]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-primary" />
          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Questions / Câu Hỏi</Label>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
          {questions.length} Total Nodes / Tổng số câu
        </span>
      </div>

      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
        {hasDifficultyMetadata && (
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Filter by Difficulty / Lọc theo độ khó</p>
            <div className="flex flex-wrap gap-4">
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <div key={d} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm">
                  <Checkbox 
                    id={`diff-${d}`} 
                    checked={selectedDifficulties.includes(d)}
                    onCheckedChange={(val) => {
                      if (val) setSelectedDifficulties([...selectedDifficulties, d]);
                      else setSelectedDifficulties(selectedDifficulties.filter(item => item !== d));
                    }}
                  />
                  <Label htmlFor={`diff-${d}`} className="text-[10px] font-bold uppercase cursor-pointer">
                    {d} ({difficultyCounts[d]})
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <RadioGroup value={selectionType} onValueChange={(v: any) => setSelectionType(v)} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-xs font-bold cursor-pointer">All questions / Tất cả câu hỏi</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random" className="text-xs font-bold cursor-pointer">Random selection / Chọn ngẫu nhiên</Label>
            </div>
          </RadioGroup>

          {selectionType === 'random' && (
            <div className="pl-7 space-y-4 animate-in slide-in-from-left-2">
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <Label className="text-[9px] font-black uppercase text-slate-400">Count / Số câu</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={questions.length} 
                    value={randomCount}
                    onChange={(e) => setRandomCount(parseInt(e.target.value) || 1)}
                    className="h-10 rounded-xl bg-white font-black"
                  />
                </div>
                <div className="flex-1 pt-6">
                  <p className="text-[11px] font-bold text-primary italic">
                    Will export {randomCount} of {questions.length} questions
                    <br />
                    <span className="text-[10px] opacity-70">Sẽ xuất {randomCount} trong {questions.length} câu hỏi</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
