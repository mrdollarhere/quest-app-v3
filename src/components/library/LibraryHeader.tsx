"use client";

import React from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LibraryHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  viewMode: 'card' | 'list';
  setViewMode: (mode: 'card' | 'list') => void;
  loading: boolean;
  onRefresh: () => void;
}

export function LibraryHeader({ 
  search, 
  setSearch, 
  viewMode, 
  setViewMode, 
  loading, 
  onRefresh 
}: LibraryHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-12 w-12 border-2 border-transparent hover:border-slate-100 transition-all">
                <ArrowLeft className="w-6 h-6 text-slate-900" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Intelligence Library</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                DNTRNG™ Registry Active
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Query by name, classification or description..." 
                className="pl-11 h-12 rounded-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-full border shadow-inner">
              <Button 
                variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('card')}
                className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'card' ? "bg-white shadow-md text-primary" : "text-slate-400")}
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('list')}
                className={cn("rounded-full h-10 w-10 transition-all", viewMode === 'list' ? "bg-white shadow-md text-primary" : "text-slate-400")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-12 w-12 border-2 hover:bg-slate-50">
              <Loader2 className={cn("w-5 h-5", loading ? "animate-spin text-primary" : "text-slate-400")} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
