"use client";

import React from 'react';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="text-center py-32 bg-slate-50 dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
      <div className="bg-white dark:bg-slate-800 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
        <Search className="w-10 h-10 text-slate-200 dark:text-slate-700" />
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Intelligence Matches</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-xs mx-auto text-lg">The DNTRNG™ registry found no modules matching your specific query parameters.</p>
      <Button variant="link" onClick={onClear} className="mt-6 font-black text-primary uppercase tracking-widest text-xs">Clear Search Filters</Button>
    </div>
  );
}
