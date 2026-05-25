/**
 * QuizHeader.tsx
 * 
 * Purpose: Top navigation and progress indicator for active assessments.
 * Extracted v19.6 (Phase 2 Refactor).
 */

"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize } from "lucide-react";
import { QuizTimer } from './QuizTimer';
import { cn } from "@/lib/utils";

interface QuizHeaderProps {
  current: number;
  total: number;
  title: string;
  timeLeft: number;
  isRaceMode: boolean;
  isAnswerConfirmed: boolean;
  isFullscreen: boolean;
  textSize: string;
  onPrev: () => void;
  onNext: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onSetTextSize: (size: 'small' | 'normal' | 'large') => void;
  onSubmit: () => void;
  activeShortcut: string | null;
}

export function QuizHeader({
  current, total, title, timeLeft, isRaceMode, isAnswerConfirmed,
  isFullscreen, textSize, onPrev, onNext, onToggleSidebar, 
  onToggleFullscreen, onSetTextSize, onSubmit, activeShortcut
}: QuizHeaderProps) {
  
  const progress = (current / total) * 100;

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Button variant="ghost" onClick={onPrev} disabled={current === 1 || isRaceMode || isAnswerConfirmed} className={cn("rounded-xl h-12 px-2 md:px-4 text-slate-400 font-bold", activeShortcut === 'prev' && "bg-primary/10 scale-95")}>
            <ChevronLeft className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Trước</span>
          </Button>
          <div className="h-6 w-px bg-slate-100 hidden md:block" />
          <span className="text-sm md:text-base font-black text-primary">{current}/{total}</span>
        </div>

        <div className="hidden xl:flex flex-1 items-center justify-center px-8">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 truncate max-w-sm text-center">{title}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="flex items-center gap-1 md:gap-4">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} disabled={isRaceMode} className={cn("rounded-full h-10 w-10 text-slate-400", activeShortcut === 'grid' && "bg-primary/10 scale-95", isRaceMode && "opacity-30")}>
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="rounded-full h-10 w-10 text-slate-400 hidden sm:flex">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
            <div className="hidden sm:flex gap-1 text-slate-400">
              {['small', 'normal', 'large'].map((s: any) => (
                <Button key={s} variant="ghost" size="icon" onClick={() => onSetTextSize(s)} className={cn("rounded-full h-10 w-10", textSize === s && "text-primary bg-primary/5")}>
                  <span className={cn("font-black", s === 'small' ? "text-xs" : s === 'large' ? "text-base" : "text-sm")}>A{s === 'small' ? '-' : s === 'large' ? '+' : ''}</span>
                </Button>
              ))}
            </div>
          </div>
          <QuizTimer timeLeft={timeLeft} />
          {current === total && isAnswerConfirmed ? (
            <Button onClick={onSubmit} className="bg-primary text-white rounded-xl h-12 px-8 font-black shadow-xl border-none">COMMIT</Button>
          ) : (
            <Button onClick={onNext} disabled={!isAnswerConfirmed} className={cn("bg-[#366DC7] text-white rounded-xl h-12 px-4 md:px-8 font-black gap-3 border-none", activeShortcut === 'next' && "scale-95")}>
              Tiếp <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-100"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
    </header>
  );
}
