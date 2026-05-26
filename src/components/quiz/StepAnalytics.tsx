"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { History, CheckCircle2, X, AlertCircle, ChevronDown, Info, Lightbulb, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from './QuestionRenderer';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AIExplanationNode } from './results/AIExplanationNode';

interface StepAnalyticsProps {
  questions: any[];
  responses: any[];
  serverReviewData?: any[];
  textSize: 'normal' | 'large' | 'small';
}

type FilterMode = 'all' | 'incorrect';

function Legend() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-10 bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="leading-none">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Legend</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">Chú thích</span>
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-50 mt-2">
          <LegendItem icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} label="Your correct answer" subLabel="Câu trả lời đúng của bạn" color="text-emerald-600" />
          <LegendItem icon={<X className="w-4 h-4 text-rose-500" />} label="Your wrong answer" subLabel="Câu trả lời sai của bạn" color="text-rose-600" />
          <LegendItem icon={<Lightbulb className="w-4 h-4 text-emerald-500" />} label="Correct answer (missed)" subLabel="Đáp án đúng (bị bỏ lỡ)" color="text-emerald-600" dashed />
          <LegendItem icon={<CircleOff className="w-4 h-4 text-amber-500" />} label="Not answered" subLabel="Chưa trả lời" color="text-amber-600" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function LegendItem({ icon, label, subLabel, color, dashed = false }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2",
        dashed ? "border-dashed border-emerald-500 bg-white" : "border-slate-100 bg-slate-50"
      )}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className={cn("text-[10px] font-black uppercase tracking-tight leading-none", color)}>{label}</p>
        <p className="text-[9px] font-medium text-slate-400 italic">{subLabel}</p>
      </div>
    </div>
  );
}

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
        className="flex flex-col md:flex-row md:items-center justify-between px-4 cursor-pointer group/header select-none hover:bg-slate-50 dark:hover:bg-slate-900/50 py-8 rounded-[3rem] transition-all duration-300 gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/5 rounded-[2rem] flex items-center justify-center border border-primary/10 transition-transform group-hover/header:scale-105 group-hover/header:rotate-3 shadow-sm">
            <History className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-col">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Review Answers</h3>
              <p className="text-xl font-bold text-slate-400 uppercase tracking-tight leading-none mt-1">Xem Lại Đáp Án</p>
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">See what you got right and wrong</p>
              <p className="text-[10px] font-medium text-slate-400/80 uppercase tracking-[0.4em] mt-0.5">Xem câu đúng và câu sai của bạn</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200">
            <Button variant={filterMode === 'all' ? 'default' : 'ghost'} size="sm" onClick={(e) => handleFilterChange('all', e)} className={cn("rounded-xl h-12 px-6", filterMode === 'all' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>
              <div className="flex flex-col items-center">
                <span className="block font-black uppercase text-[10px]">All</span>
                <span className="block font-bold uppercase text-[9px] opacity-70">Tất cả</span>
              </div>
            </Button>
            <Button variant={filterMode === 'incorrect' ? 'default' : 'ghost'} size="sm" onClick={(e) => handleFilterChange('incorrect', e)} className={cn("rounded-xl h-12 px-6", filterMode === 'incorrect' ? "bg-white text-rose-500 shadow-sm" : "text-slate-400")}>
              <div className="flex flex-col items-center">
                <span className="block font-black uppercase text-[10px]">Wrong Only</span>
                <span className="block font-bold uppercase text-[9px] opacity-70">Chỉ Câu Sai</span>
              </div>
            </Button>
          </div>
          <div className={cn("p-4 rounded-full border transition-all duration-500", isCollapsed ? "bg-white text-slate-300" : "bg-primary text-white border-primary shadow-lg shadow-primary/20")}>
            <ChevronDown className={cn("w-6 h-6 transition-transform duration-500", !isCollapsed && "rotate-180")} />
          </div>
        </div>
      </div>

      <div className={cn("transition-all duration-500 ease-in-out overflow-hidden", isCollapsed ? "max-h-0 opacity-0" : "max-h-[99999px] opacity-100 mt-10")}>
        <Legend />
        
        {filteredItems.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredItems.map((item, idx) => {
              const hasAnswer = item.submittedAnswer !== null && (
                typeof item.submittedAnswer === 'string' ? item.submittedAnswer.trim() !== "" :
                Array.isArray(item.submittedAnswer) ? item.submittedAnswer.length > 0 :
                typeof item.submittedAnswer === 'object' ? Object.keys(item.submittedAnswer).length > 0 :
                item.submittedAnswer !== undefined
              );

              return (
                <AccordionItem 
                  key={item.questionId} 
                  value={`item-${idx}`}
                  className={cn(
                    "border-none rounded-[2rem] overflow-hidden bg-white border border-slate-100 transition-all hover:bg-slate-50/50 shadow-sm", 
                    !hasAnswer ? "border-l-[6px] border-l-amber-400" : (item.isCorrect ? "border-l-[6px] border-l-emerald-500" : "border-l-[6px] border-l-rose-500")
                  )}
                >
                  <AccordionTrigger className="px-10 py-8 hover:no-underline group">
                    <div className="flex items-center gap-10 text-left w-full">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2",
                        !hasAnswer ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/10" : (item.isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/10")
                      )}>
                        {!hasAnswer ? <CircleOff className="w-6 h-6" /> : (item.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="leading-tight">
                            <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Question {idx + 1}</span>
                            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-slate-300 mt-0.5">Câu {idx + 1}</span>
                          </div>
                          <div className={cn(
                            "px-4 py-1.5 rounded-full shadow-sm", 
                            !hasAnswer ? "bg-amber-500 text-white" : (item.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")
                          )}>
                            <div className="leading-tight text-center">
                              <span className="block text-[9px] font-black uppercase tracking-widest">{!hasAnswer ? "Skipped" : (item.isCorrect ? "Correct ✓" : "Wrong ✗")}</span>
                              <span className="block text-[8px] font-bold uppercase tracking-widest opacity-80">{!hasAnswer ? "Bỏ qua" : (item.isCorrect ? "Đúng ✓" : "Sai ✗")}</span>
                            </div>
                          </div>
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

                      <AIExplanationNode 
                        questionId={item.questionId}
                        questionText={item.questionText}
                        questionType={item.questionType}
                        correctAnswer={item.correctAnswer}
                        studentAnswer={item.submittedAnswer}
                        isCorrect={item.isCorrect}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Perfect! No mistakes.</h4>
              <p className="text-xl font-bold text-slate-400 uppercase tracking-tight">Tuyệt vời! Không có lỗi sai.</p>
            </div>
            <Button variant="link" onClick={(e) => handleFilterChange('all', e)} className="mt-8 h-auto p-0">
              <div className="flex flex-col items-center">
                <span className="block font-black uppercase text-[10px] text-primary tracking-widest">View All Questions</span>
                <span className="block font-bold uppercase text-[9px] text-primary/70 tracking-widest mt-0.5">Xem tất cả câu hỏi</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
