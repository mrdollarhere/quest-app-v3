"use client";

import React from 'react';
import { QuizState } from '@/types/quiz';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QuizSidebarProps {
  quiz: QuizState;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJump: (idx: number) => void;
  isAnswered: (id: string) => boolean;
}

export function QuizSidebar({ quiz, isOpen, onOpenChange, onJump, isAnswered }: QuizSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[450px] p-0 flex flex-col bg-white border-l border-slate-100">
        <SheetHeader className="p-8 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black tracking-tighter uppercase text-slate-900">Questions</SheetTitle>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4" aria-hidden="true">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unread</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Marked</span>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <nav className="p-6 pb-24" aria-label="Question navigator">
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const answered = isAnswered(q.id);
                const flagged = quiz.flaggedQuestionIds?.includes(q.id);
                const active = quiz.currentQuestionIndex === idx;
                
                const statusLabel = flagged ? 'flagged' : (answered ? 'answered' : 'unanswered');
                const ariaLabel = `Question ${idx + 1}, ${statusLabel}${active ? ', current' : ''}`;

                return (
                  <button
                    key={q.id}
                    onClick={() => { onJump(idx); onOpenChange(false); }}
                    aria-label={ariaLabel}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all border-2",
                      active 
                        ? "border-primary bg-primary/5 text-primary" 
                        : (flagged ? "bg-orange-500 border-orange-500 text-white" : (answered ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"))
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
