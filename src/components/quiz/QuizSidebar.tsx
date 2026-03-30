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
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[450px] p-0 flex flex-col bg-white border-l border-slate-100">
        <SheetHeader className="p-8 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black tracking-tighter uppercase text-slate-900">Questions</SheetTitle>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
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
          <div className="p-2 pb-24">
            {quiz.questions.map((q, idx) => {
              const answered = isAnswered(q.id);
              const flagged = quiz.flaggedQuestionIds?.includes(q.id);
              const active = quiz.currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => { onJump(idx); onOpenChange(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all group mb-1",
                    active 
                      ? "bg-primary/5 ring-1 ring-primary/20" 
                      : "hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "text-xs font-black w-7 text-right shrink-0",
                    active ? "text-primary" : "text-slate-300"
                  )}>
                    {idx + 1}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] font-medium truncate",
                      active ? "text-slate-900" : "text-slate-500"
                    )}>
                      {truncateText(q.question_text, 45)}
                    </p>
                  </div>

                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0 transition-all",
                    flagged ? "bg-orange-500" : (answered ? "bg-green-500" : "bg-slate-200")
                  )} />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
