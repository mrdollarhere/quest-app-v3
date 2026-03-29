"use client";

import React from 'react';
import Link from 'next/link';
import { Clock, ListChecks, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardViewProps {
  tests: any[];
}

export function CardView({ tests }: CardViewProps) {
  const getGradient = (category: string) => {
    const hash = (category || 'general').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-rose-600',
      'from-purple-500 to-pink-600',
      'from-slate-700 to-slate-900'
    ];
    return gradients[hash % gradients.length];
  };

  const getDifficultyColor = (diff: string) => {
    const d = (diff || '').toLowerCase();
    if (d === 'beginner') return 'bg-emerald-500';
    if (d === 'easy') return 'bg-amber-500';
    if (d === 'medium') return 'bg-orange-500';
    if (d === 'hard') return 'bg-red-500';
    return 'bg-slate-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {tests.map((test) => (
        <Link key={test.id} href={`/quiz?id=${test.id}`} className="group block">
          <Card className="h-full flex flex-col overflow-hidden border-none shadow-sm dark:shadow-slate-900/50 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 rounded-[3rem] bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              {test.image_url ? (
                <img 
                  src={test.image_url} 
                  alt={test.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                />
              ) : (
                <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center p-8", getGradient(test.category))}>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl">
                    <Badge className="bg-white/90 text-slate-900 font-black uppercase text-[10px] tracking-widest">{test.category || "GENERAL"}</Badge>
                  </div>
                </div>
              )}
              <div className="absolute top-6 left-6">
                <Badge className="bg-white/95 dark:bg-slate-900/95 text-primary shadow-2xl border-none backdrop-blur-xl font-black text-[9px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-full">
                  {test.category || "General"}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <CardHeader className="flex-1 px-8 pt-8 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("w-2.5 h-2.5 rounded-full", getDifficultyColor(test.difficulty))} />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{test.difficulty || 'Beginner'}</span>
              </div>
              <CardTitle className="text-[clamp(1.25rem,4vw,1.75rem)] font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight leading-tight">
                {test.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-4 font-medium text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {test.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-6">
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                <div className="flex items-center gap-2.5">
                  <ListChecks className="w-4 h-4 text-primary opacity-40" />
                  {test.questions_count !== undefined && test.questions_count !== null ? (
                    <span>{test.questions_count} Steps</span>
                  ) : (
                    <div className="w-12 h-3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
                  )}
                </div>
                <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary opacity-40" />
                  <span>{test.duration || '15m'}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-8 pb-8 pt-0 mt-auto">
              <Button 
                variant="outline"
                className="rounded-full font-black text-[10px] uppercase tracking-widest border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all gap-2"
              >
                Start
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
