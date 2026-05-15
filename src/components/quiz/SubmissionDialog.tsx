"use client";

import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ClipboardCheck, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  answeredCount: number;
  totalCount: number;
  questions: any[];
  isAnswered: (id: string) => boolean;
  onJump: (idx: number) => void;
}

export function SubmissionDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  answeredCount, 
  totalCount,
  questions,
  isAnswered,
  onJump
}: SubmissionDialogProps) {
  const isComplete = answeredCount === totalCount;
  const unansweredCount = totalCount - answeredCount;

  const unansweredIndices = questions
    .map((q, i) => isAnswered(q.id) ? -1 : i)
    .filter(i => i !== -1);

  const handleJump = (idx: number) => {
    onOpenChange(false);
    onJump(idx);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md animate-in zoom-in-95 duration-300">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full text-slate-400 hover:text-slate-900 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-8 pt-12 text-center space-y-6">
          <div className={cn(
            "mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-2",
            isComplete ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
          )}>
            {isComplete ? <ClipboardCheck className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          
          <div className="space-y-2">
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900">
              {isComplete ? "Finalize Mission?" : "Incomplete Registry"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed px-4">
              {isComplete 
                ? `You've synchronized all ${totalCount} nodes. Ready to commit to the registry?`
                : `You have ${unansweredCount} uninitialized question nodes. Select a node below to calibrate or submit as-is.`
              }
            </AlertDialogDescription>
          </div>

          <div className="space-y-3 px-4">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span>Overall Progress</span>
              <span className={cn(isComplete ? "text-emerald-500" : "text-amber-500")}>
                {answeredCount} / {totalCount} Initialized
              </span>
            </div>
            <Progress 
              value={(answeredCount / (totalCount || 1)) * 100} 
              className={cn("h-1.5 rounded-full", isComplete ? "bg-emerald-100" : "bg-amber-100")} 
            />
          </div>

          {!isComplete && (
            <div className="pt-4 space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left px-4">Pending Nodes</p>
              <div className="flex flex-wrap gap-2 px-4 max-h-[120px] overflow-y-auto custom-scrollbar pb-2">
                {unansweredIndices.map((idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJump(idx)}
                    className="h-10 w-10 rounded-xl bg-amber-50 border-2 border-amber-100 text-amber-600 font-black text-xs hover:bg-amber-100 hover:scale-105 transition-all"
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 p-8 pt-0 mt-0">
          <AlertDialogCancel asChild>
            <Button className="h-14 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs flex-1 border-none order-2 sm:order-1">
              Resume Mission
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onSubmit} 
              className={cn(
                "h-14 rounded-full font-black uppercase tracking-widest text-xs flex-1 shadow-xl border-none order-1 sm:order-2",
                isComplete ? "bg-primary text-white shadow-primary/20" : "bg-amber-500 text-white shadow-amber-500/20"
              )}
            >
              Commit Data {isComplete ? <ChevronRight className="ml-2 w-4 h-4" /> : null}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
