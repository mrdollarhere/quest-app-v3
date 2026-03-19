"use client";

import React from 'react';
import Link from 'next/link';
import { Play, Clock, BarChart, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardViewProps {
  tests: any[];
}

export function CardView({ tests }: CardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {tests.map((test) => (
        <Card key={test.id} className="group flex flex-col overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[3rem] bg-white">
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            <img 
              src={test.image_url || `https://picsum.photos/seed/${test.id}/800/450`} 
              alt={test.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/95 text-primary hover:bg-white shadow-xl border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
                {test.category || "General"}
              </Badge>
            </div>
          </div>

          <CardHeader className="flex-1 px-8 pt-8 pb-4">
            <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
              {test.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-4 font-medium text-slate-500 text-sm leading-relaxed">
              {test.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-6">
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary opacity-30" />
                <span>{test.questions_count || '--'} Items</span>
              </div>
              <div className="h-4 w-px bg-slate-100" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary opacity-30" />
                <span>{test.duration || '15m'} Session</span>
              </div>
              <div className="h-4 w-px bg-slate-100" />
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-primary opacity-30" />
                <span className={cn(
                  test.difficulty === 'Beginner' ? 'text-green-600' :
                  test.difficulty === 'Intermediate' ? 'text-orange-600' : 'text-red-600'
                )}>
                  {test.difficulty || 'Beginner'}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8 pt-0 mt-auto">
            <Link href={`/quiz?id=${test.id}`} className="w-full">
              <Button className="w-full h-14 rounded-full font-black text-xs uppercase tracking-widest shadow-xl group-hover:shadow-primary/20 transition-all hover:scale-[1.02] bg-primary">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Initialize Module
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
