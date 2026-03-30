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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ClipboardCheck } from "lucide-react";

interface SubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  answeredCount: number;
  totalCount: number;
}

export function SubmissionDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  answeredCount, 
  totalCount 
}: SubmissionDialogProps) {
  const isComplete = answeredCount === totalCount;
  const unansweredCount = totalCount - answeredCount;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full text-slate-400 hover:text-slate-900 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-10 pt-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-2">
            <ClipboardCheck className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900">
              Submit Test?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-slate-500 leading-relaxed px-4">
              {isComplete 
                ? `You've answered all ${totalCount} questions. Ready to submit?`
                : `You have ${unansweredCount} unanswered questions out of ${totalCount}. You can go back and review, or submit now.`
              }
            </AlertDialogDescription>
          </div>

          <div className="space-y-3 px-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Progress</span>
              <span className="text-primary">{answeredCount} / {totalCount} Answered</span>
            </div>
            <Progress value={(answeredCount / totalCount) * 100} className="h-2 rounded-full" />
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 p-8 pt-0 mt-0">
          <AlertDialogCancel asChild>
            <Button className="h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs flex-1 shadow-xl shadow-primary/20 border-none order-2 sm:order-1">
              Review Answers
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="ghost" 
              onClick={onSubmit} 
              className="h-14 rounded-full font-black uppercase tracking-widest text-xs flex-1 text-slate-400 hover:text-slate-900 hover:bg-slate-50 order-1 sm:order-2"
            >
              Submit Now
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
