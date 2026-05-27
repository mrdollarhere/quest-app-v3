/**
 * CardView.tsx
 * 
 * Purpose: Renders the assessment library as a grid of interactive cards.
 * Redesigned v19.5: Information-rich header bands and dynamic accent colors.
 * Design: Visual elements utilize sharp rectangular geometry (rounded-none).
 * Resiliency: Defensive Iteration Protocol v1.1.
 * Updated v19.6: Fully dynamic category colors.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ListChecks, Radio } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackEvent } from '@/lib/tracker';

interface CardViewProps {
  tests: any[];
  uniqueCategories?: string[];
}

const CARD_GRADIENTS = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600',
  'from-red-500 to-rose-600',
  'from-sky-500 to-blue-600',
];

export function CardView({ tests, uniqueCategories }: CardViewProps) {
  const [liveTests, setLiveTests] = useState<string[]>([]);
  
  const safeTests = Array.isArray(tests) ? tests : [];

  // REGISTRY PROTOCOL: If uniqueCategories is not provided, derive it from current tests
  const categoryPool = useMemo(() => {
    if (uniqueCategories && uniqueCategories.length > 0) return uniqueCategories;
    const cats = new Set<string>();
    safeTests.forEach(t => {
      const c = (t.category || "General").trim();
      if (c) cats.add(c);
    });
    return Array.from(cats).sort();
  }, [safeTests, uniqueCategories]);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const res = await fetch('/api/live/status');
        const data = await res.json();
        setLiveTests(data.liveTests || []);
      } catch (e) {}
    };
    checkLive();
    const interval = setInterval(checkLive, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryGradient = (category: string) => {
    const cat = (category || "General").trim();
    const idx = categoryPool.indexOf(cat);
    if (idx === -1) return "from-indigo-500 to-indigo-600";
    return CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  };

  const getDifficultyColor = (diff: string) => {
    const d = String(diff || "").toLowerCase();
    if (d === 'beginner' || d === 'easy') return 'bg-emerald-500';
    if (d === 'medium') return 'bg-amber-500';
    if (d === 'hard') return 'bg-red-500';
    return 'bg-slate-400';
  };

  const normalizeDuration = (duration: any) => {
    const s = String(duration || "").toLowerCase();
    const num = s.match(/\d+/);
    if (!num) return "15 phút";
    return `${num[0]} phút`;
  };

  const getDecorativeNumber = (title: string) => {
    const match = title.match(/(\d+)$/);
    return match ? match[1] : null;
  };

  return (
    <>
      {safeTests.map((test) => {
        const isLive = liveTests.includes(test.id);
        const decorativeNum = getDecorativeNumber(test.title);
        
        return (
          <Link 
            key={test.id} 
            href={`/quiz?id=${test.id}`} 
            className="group block focus-visible:ring-2 focus-visible:ring-primary rounded-none outline-none"
            onClick={() => trackEvent('test_card_click', { test_id: test.id, test_name: test.title })}
          >
            <Card className="h-full flex flex-col overflow-hidden border-[0.5px] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-none bg-white dark:bg-slate-900">
              {/* HEADER BAND: Information-rich information node */}
              <div className={cn(
                "relative h-[110px] w-full p-4 flex flex-col justify-between overflow-hidden shrink-0 bg-gradient-to-br", 
                getCategoryGradient(test.category)
              )}>
                {/* Decorative Identification Number */}
                {decorativeNum && (
                  <span className="absolute -right-2 -bottom-4 text-[80px] font-black text-white/10 select-none pointer-events-none">
                    {decorativeNum}
                  </span>
                )}

                {/* Top Row: Badges */}
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-none">
                      {test.category || "General"}
                    </Badge>
                    {isLive && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 rounded-none shadow-lg animate-in zoom-in">
                        <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Live Now</span>
                      </div>
                    )}
                  </div>
                  <Badge className="bg-black/20 text-white border-none backdrop-blur-md font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-none flex items-center gap-1.5">
                    <ListChecks className="w-3 h-3" />
                    {test.questions_count ?? "0"}
                  </Badge>
                </div>

                {/* Bottom Row: Large Title */}
                <CardTitle className="text-[18px] font-bold text-white group-hover:text-white transition-colors tracking-tight leading-tight line-clamp-2 z-10 drop-shadow-sm">
                  {test.title}
                </CardTitle>
              </div>

              {/* BODY: Metadata and Action Registry */}
              <div className="p-4 flex-1 min-h-[100px] flex flex-col justify-between bg-white dark:bg-slate-900">
                <div className="space-y-3">
                  {/* Row 1: Difficulty + Duration Protocol */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", getDifficultyColor(test.difficulty))} />
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{test.difficulty || 'Beginner'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{normalizeDuration(test.duration)} / {normalizeDuration(test.duration).replace('phút', 'min')}</span>
                    </div>
                  </div>

                  {/* Row 2: Description Fragment */}
                  {test.description && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed italic">
                      {test.description.substring(0, 60)}
                      {test.description.length > 60 ? "..." : ""}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Commitment Action */}
                <div className="pt-4">
                  <Button className={cn(
                    "w-full h-10 rounded-none font-black text-[12px] uppercase tracking-tighter transition-all border-none shadow-sm",
                    isLive ? "bg-rose-50 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  )}>
                    {isLive ? 'Tham gia / Join' : 'Bắt đầu / Start'}
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </>
  );
}
