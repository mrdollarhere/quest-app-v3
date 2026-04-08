"use client";

import React from 'react';
import { History, CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question, UserResponse } from '@/types/quiz';
import { QuestionRenderer } from './QuestionRenderer';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StepAnalyticsProps {
  questions: Question[];
  responses: UserResponse[];
  textSize: 'normal' | 'large' | 'small';
}

export function StepAnalytics({ questions, responses, textSize }: StepAnalyticsProps) {
  return (
    <div className="space-y-10 pt-16 border-t border-slate-200">
      <div className="flex items-center gap-5 px-4">
        <div className="w-14 h-14 bg-primary/5 rounded-[1.5rem] flex items-center justify-center border border-primary/10">
          <History className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-4xl font-black tracking-tight text-slate-900 uppercase leading-none">Question Review</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">See how you did on each question</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {questions.map((q, idx) => {
          const userResp = responses.find(r => r.questionId === q.id)?.answer;
          const isCorrect = calculateScoreForQuestion(q, userResp);
          const hasAnswered = userResp !== undefined && userResp !== null;

          return (
            <AccordionItem 
              key={q.id} 
              value={`item-${idx}`}
              className={cn(
                "border-none rounded-[2rem] overflow-hidden bg-white border border-slate-100 transition-all hover:bg-slate-50/50 group/acc shadow-sm",
                isCorrect ? "border-l-[6px] border-l-emerald-500" : (hasAnswered ? "border-l-[6px] border-l-rose-500" : "border-l-[6px] border-l-slate-300")
              )}
            >
              <AccordionTrigger className="px-10 py-8 hover:no-underline group">
                <div className="flex items-center gap-10 text-left w-full">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                    !q.correct_answer ? "bg-slate-100 border-slate-200 text-slate-400" : 
                    (isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white")
                  )}>
                    {!q.correct_answer ? <AlertCircle className="w-6 h-6" /> : (isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Step {idx + 1}</span>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                      )}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {q.question_text}
                    </h4>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 pt-0">
                <div className="h-px w-full bg-slate-100 mb-8" />
                <div className="max-w-4xl mx-auto rounded-[2rem] bg-slate-50 p-8 border border-slate-100 shadow-inner" data-textsize={textSize}>
                  <QuestionRenderer 
                    question={q} 
                    value={userResp} 
                    onChange={() => {}} 
                    reviewMode={true} 
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
