"use client";

import React from 'react';
import Link from 'next/link';
import { Play, Clock, BarChart, ListChecks, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardViewProps {
  tests: any[];
}

export function CardView({ tests }: CardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {tests.map((test) => (
        <Card key={test.id} className="group flex flex-col overflow-hidden border-none shadow-sm dark:shadow-slate-900/50 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-primary/5 hover:-translate-y-3 transition-all duration-700 rounded-[4rem] bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={test.image_url || `https://picsum.photos/seed/${test.id}/800/450`} 
              alt={test.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
            />
            <div className="absolute top-6 left-6">
              <Badge className="bg-white/95 dark:bg-slate-900/95 text-primary hover:bg-white dark:hover:bg-slate-800 shadow-2xl border-none backdrop-blur-xl font-black text-[9px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-full">
                {test.category || "General"}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          <CardHeader className="flex-1 px-10 pt-10 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                "w-2 h-2 rounded-full",
                test.difficulty === 'Beginner' ? 'bg-green-500' :
                test.difficulty === 'Intermediate' ? 'bg-orange-500' : 'bg-red-500'
              )} />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{test.difficulty || 'Beginner'}</span>
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight line-clamp-1">
              {test.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-4 font-medium text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              {test.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-8">
            <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
              <div className="flex items-center gap-2.5">
                <ListChecks className="w-4 h-4 text-primary opacity-40" />
                <span>{test.questions_count || '--'} Steps</span>
              </div>
              <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary opacity-40" />
                <span>{test.duration || '15m'} Session</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-10 pb-10 pt-0 mt-auto">
            <Link href={`/quiz?id=${test.id}`} className="w-full">
              <Button className="w-full h-16 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl group-hover:shadow-primary/30 transition-all hover:scale-[1.02] bg-slate-900 dark:bg-primary text-white group-hover:bg-primary dark:group-hover:bg-primary/90 border-none">
                Start Learning
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
