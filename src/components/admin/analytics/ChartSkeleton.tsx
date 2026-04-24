"use client";

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <div className="w-full h-[350px] flex flex-col gap-4 p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex-1 flex items-end gap-3 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg bg-slate-200/50 dark:bg-slate-700/50" 
            style={{ height: `${Math.random() * 60 + 20}%` }} 
          />
        ))}
      </div>
      <div className="h-4 w-full flex justify-between gap-4 mt-2">
        <Skeleton className="h-2 w-12 rounded-full" />
        <Skeleton className="h-2 w-12 rounded-full" />
        <Skeleton className="h-2 w-12 rounded-full" />
        <Skeleton className="h-2 w-12 rounded-full" />
      </div>
    </div>
  );
}
