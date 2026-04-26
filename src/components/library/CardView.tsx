
/**
 * CardView.tsx
 * 
 * Purpose: Renders the assessment library as a grid of interactive cards.
 * Features "LIVE" badge for active real-time sessions (v18.9).
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ListChecks, Radio } from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackEvent } from '@/lib/tracker';

interface CardViewProps {
  tests: any[];
}

export function CardView({ tests }: CardViewProps) {
  const [liveTests, setLiveTests] = useState<string[]>([]);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const res = await fetch('/api/live/status');
        const data = await res.json();
        setLiveTests(data.liveTests || []);
      } catch (e) {}
    };
    checkLive();
    const interval = setInterval(checkLive, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  const getCategoryGradient = (category: string) => {
    const cat = String(category || "").toUpperCase();
    if (cat.includes("LV1")) return "from-[#059669] to-[#34d399]";
    if (cat.includes("LV2")) return "from-[#1d4ed8] to-[#60a5fa]";
    if (cat.includes("LV3")) return "from-[#7c3aed] to-[#c084fc]";
    return "from-[#1a2340] to-[#3B5BDB]";
  };

  const getDifficultyColor = (diff: string) => {
    const d = String(diff || "").toLowerCase();
    if (d === 'beginner' || d === 'easy') return 'bg-emerald-500';
    if (d === 'medium') return 'bg-amber-500';
    if (d === 'hard') return 'bg-red-500';
    return 'bg-slate-400';
  };

  return (
    <>
      {tests.map((test, index) => {
        const isLive = liveTests.includes(test.id);
        
        return (
          <Link 
            key={test.id} 
            href={`/quiz?id=${test.id}`} 
            className="group block focus-visible:ring-2 focus-visible:ring-primary rounded-[16px] outline-none"
            onClick={() => trackEvent('test_card_click', { test_id: test.id, test_name: test.title })}
          >
            <Card className="h-full flex flex-col overflow-hidden border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-[16px] bg-white dark:bg-slate-900">
              <div className="relative h-[130px] w-full overflow-hidden aspect-video">
                {test.image_url ? (
                  <>
                    <Image 
                      src={test.image_url} 
                      alt={`Preview for ${test.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                ) : (
                  <div className={cn("w-full h-full bg-gradient-to-br", getCategoryGradient(test.category))} />
                )}
                
                {isLive && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-rose-500 rounded-full shadow-lg animate-in zoom-in">
                    <Radio className="w-3 h-3 text-white animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Live Now</span>
                  </div>
                )}

                {!isLive && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/25 text-white border-none backdrop-blur-md font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {test.category || "General"}
                    </Badge>
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/20 text-white border-none backdrop-blur-md font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1.5">
                    <ListChecks className="w-3 h-3" aria-hidden="true" />
                    {test.questions_count ?? "0"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-[14px] pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("w-2 h-2 rounded-full", getDifficultyColor(test.difficulty))} aria-hidden="true" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{test.difficulty || 'Beginner'}</span>
                </div>
                <CardTitle className="text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-2 min-h-[32px]">
                  <h2 className="text-inherit font-inherit">{test.title}</h2>
                </CardTitle>
              </CardHeader>

              <CardFooter className="p-[14px] pt-4 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{test.duration || '15m'}</span>
                </div>
                <Button className={cn(
                  "h-7 px-4 rounded-[8px] font-black text-[11px] uppercase tracking-tighter border-none",
                  isLive ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-[#1a2340] text-white"
                )}>
                  {isLive ? 'Join Live' : 'Start'}
                </Button>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </>
  );
}
