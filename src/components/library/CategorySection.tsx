"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CardView } from './CardView';
import { ListView } from './ListView';

interface CategorySectionProps {
  name: string;
  tests: any[];
  viewMode: 'card' | 'list';
  isDefaultExpanded: boolean;
  isSearching: boolean;
}

export function CategorySection({ 
  name, 
  tests, 
  viewMode, 
  isDefaultExpanded,
  isSearching 
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  
  // Persistent expansion protocol
  const storageKey = `dntrng_cat_expanded_${name}`;

  useEffect(() => {
    if (isSearching) {
      setIsExpanded(true);
      return;
    }
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setIsExpanded(saved === 'true');
    } else {
      setIsExpanded(isDefaultExpanded);
    }
  }, [isDefaultExpanded, isSearching, storageKey]);

  const toggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(storageKey, String(newState));
  };

  const getTierColor = (catName: string) => {
    const n = catName.toUpperCase();
    if (n.includes("LV1")) return "border-l-[#22C55E]";
    if (n.includes("LV2")) return "border-l-[#3B5BDB]";
    if (n.includes("LV3")) return "border-l-[#7C3AED]";
    return "border-l-slate-300";
  };

  const diffMix = useMemo(() => {
    const mix = { easy: false, medium: false, hard: false };
    tests.forEach(t => {
      const d = String(t.difficulty).toLowerCase();
      if (d === 'easy' || d === 'beginner') mix.easy = true;
      if (d === 'medium') mix.medium = true;
      if (d === 'hard') mix.hard = true;
    });
    return mix;
  }, [tests]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <button 
        onClick={toggle}
        className={cn(
          "w-full flex items-center justify-between p-4 pr-6 rounded-[12px] bg-white dark:bg-slate-900 border-[0.5px] border-slate-200 dark:border-slate-800 border-l-[4px] transition-all group hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm",
          getTierColor(name)
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-lg transition-transform duration-300",
            isExpanded ? "rotate-0" : "-rotate-90"
          )}>
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-primary" />
          </div>
          
          <div className="text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1.5">{name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ListChecks className="w-3 h-3" />
                {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
              </span>
              <div className="h-2 w-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex items-center gap-1.5">
                {diffMix.easy && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]" title="Easy modules present" />}
                {diffMix.medium && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.3)]" title="Medium modules present" />}
                {diffMix.hard && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.3)]" title="Hard modules present" />}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-colors">
            {isExpanded ? 'Collapse' : 'Expand'}
          </Badge>
        </div>
      </button>

      <div className={cn(
        "transition-all duration-500 overflow-hidden",
        isExpanded ? "max-h-[10000px] opacity-100 mt-6" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        {viewMode === 'card' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            <CardView tests={tests} />
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            <ListView tests={tests} />
          </div>
        )}
      </div>
    </div>
  );
}
