"use client";

import React from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, Loader2, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';

interface LibraryHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  viewMode: 'card' | 'list';
  setViewMode: (mode: 'card' | 'list') => void;
  loading: boolean;
  onRefresh: () => void;
  lastSync?: Date | null;
}

export function LibraryHeader({ 
  search, 
  setSearch, 
  viewMode, 
  setViewMode, 
  loading, 
  onRefresh,
  lastSync
}: LibraryHeaderProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const brandName = settings.platform_name || "DNTRNG";

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-12 w-12 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {brandName} Registry Active
                </p>
                {lastSync && (
                  <div className="flex items-center gap-1.5 px-3 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                    <span>Updated {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
              <Input 
                placeholder={t('searchPlaceholder')}
                className="pl-11 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-primary/40 font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
              <Button 
                variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('card')}
                className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'card' ? "bg-white dark:bg-slate-700 shadow-md text-primary" : "text-slate-400 dark:text-slate-500")}
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('list')}
                className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-md text-primary" : "text-slate-400 dark:text-slate-500")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Loader2 className={cn("w-5 h-5", loading ? "animate-spin text-primary" : "text-slate-400 dark:text-slate-600")} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
