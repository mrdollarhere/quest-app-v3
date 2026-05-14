"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { History, CheckCircle2, X, AlertCircle, ChevronDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from './QuestionRenderer';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StepAnalyticsProps {
  questions: any[];
  responses: any[];
  serverReviewData?: any[];
  textSize: 'normal' | 'large' | 'small';
}

type FilterMode = 'all' | 'incorrect';

export function StepAnalytics({ questions, serverReviewData = [], textSize }: StepAnalyticsProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  useEffect(() => {
    const savedCollapse = sessionStorage.getItem('dntrng_review_collapsed');
    if (savedCollapse !== null) setIsCollapsed(savedCollapse === 'true');
    const savedFilter = sessionStorage.getItem('dntrng_review_filter') as FilterMode;
    if (savedFilter) setFilterMode(savedFilter);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    sessionStorage.setItem('dntrng_review_collapsed', String(newState));
  };

  const handleFilterChange = (mode: FilterMode, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterMode(mode);
    sessionStorage.setItem('dntrng_review_filter', mode);
  };

  const reviewItems = useMemo(() => {
    if (serverReviewData.length > 0) return serverReviewData;
    return questions.map(q => ({
      questionId: q.id,
      questionText: q.question_text,
      questionType: q.question_type,
      image_url: q.image_url,
      options: q.options,
      isCorrect: false,
      submittedAnswer: null,
      correctAnswer: [],
      orderGroup: [],
      metadata: q.metadata
    }));
  }, [questions, serverReviewData]);

  const filteredItems = useMemo(() => {
    if (filterMode === 'all') return reviewItems;
    return reviewItems.filter(item => !item.isCorrect);
  }, [reviewItems, filterMode]);

  const incorrectCount = reviewItems.filter(item => !item.isCorrect).length;

  return (
    <div className="pt-16 border-t border-slate-200">
      <div 
        onClick={toggleCollapse}
        className="flex flex-col md:flex-row md:items-center justify-between px-4 cursor-pointer group/header select-none hover:bg-slate-50 dark:hover:bg-slate-900/50 py-6 rounded-[2.5rem] transition-all duration-300 gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/5 rounded-[1.5rem] flex items-center justify-center border border-primary/10 transition-transform group-hover/header:scale-105 group-hover/header:rotate-3 shadow-sm">
            <History className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Review Audit</h3>
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {filterMode === 'all' ? `${reviewItems.length} nodes` : `${incorrectCount} errors`}
                </span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Step-by-step diagnostic breakdown</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200">
            <Button variant={filterMode === 'all' ? 'default' : 'ghost'} size="sm" onClick={(e) => handleFilterChange('all', e)} className={cn("rounded-xl font-black uppercase text-[9px] tracking-widest h-9 px-4", filterMode === 'all' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>All</Button>
            <Button variant={filterMode === 'incorrect' ? 'default' : 'ghost'} size="sm" onClick={(e) => handleFilterChange('incorrect', e)} className={cn("rounded-xl font-black uppercase text-[9px] tracking-widest h-9 px-4", filterMode === 'incorrect' ? "bg-white text-rose-50 shadow-sm" : "text-slate-400")}>Incorrect</Button>
          </div>
          <div className={cn("p-4 rounded-full border transition-all duration-500", isCollapsed ? "bg-white text-slate-300" : "bg-primary text-white border-primary shadow-lg shadow-primary/20")}>
            <ChevronDown className={cn("w-6 h-6 transition-transform duration-500", !isCollapsed && "rotate-180")} />
          </div>
        </div>
      </div>

      <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", isCollapsed ? "max-h-0 opacity-0" : "max-h-[10000px] opacity-100 mt-10")}>
        {filteredItems.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredItems.map((item, idx) => (
              <AccordionItem 
                key={item.questionId} 
                value={`item-${idx}`}
                className={cn("border-none rounded-[2rem] overflow-hidden bg-white border border-slate-100 transition-all hover:bg-slate-50/50 shadow-sm", item.isCorrect ? "border-l-[6px] border-l-emerald-500" : "border-l-[6px] border-l-rose-500")}
              >
                <AccordionTrigger className="px-10 py-8 hover:no-underline group">
                  <div className="flex items-center gap-10 text-left w-full">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2", item.isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/10")}>
                      {item.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Step {idx + 1}</span>
                        <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", item.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>{item.isCorrect ? "Correct" : "Incorrect"}</div>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{item.questionText}</h4>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-10 pb-10 pt-0">
                  <div className="h-px w-full bg-slate-100 mb-8" />
                  <div className="max-w-4xl mx-auto rounded-[2rem] bg-slate-50 p-8 border border-slate-100 shadow-inner" data-textsize={textSize}>
                    <QuestionRenderer 
                      question={{
                        id: item.questionId,
                        question_text: item.questionText,
                        question_type: item.questionType,
                        image_url: item.image_url, 
                        options: item.options,
                        correct_answer: JSON.stringify(item.correctAnswer),
                        order_group: JSON.stringify(item.orderGroup),
                        metadata: item.metadata
                      } as any} 
                      value={item.submittedAnswer} 
                      onChange={() => {}} 
                      reviewMode={true} 
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No issues detected</h4>
            <Button variant="link" onClick={(e) => handleFilterChange('all', e)} className="mt-4 font-black uppercase text-[10px] text-primary">View All Questions</Button>
          </div>
        )}
      </div>
    </div>
  );
}
