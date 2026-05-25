/**
 * VerdictDisplay.tsx
 * 
 * Purpose: Renders the final performance judgment card with adaptive styling and icon.
 * Used by: src/components/quiz/QuizResults.tsx
 */

import React from 'react';
import { cn } from "@/lib/utils";
import { Trophy, CheckCircle2, Target, XCircle, AlertCircle } from 'lucide-react';
import { Verdict } from '@/lib/quiz-config';

interface VerdictDisplayProps {
  verdict: Verdict;
}

export function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  const IconMap = { Trophy, CheckCircle2, Target, XCircle };
  const VerdictIcon = (IconMap as any)[verdict.iconName] || AlertCircle;

  return (
    <div className={cn(
      "flex-1 p-8 rounded-[2rem] border-l-[6px] transition-all duration-500",
      verdict.border,
      verdict.bg
    )}>
      <div className="flex items-center gap-3 mb-3">
        <VerdictIcon className={cn("w-4 h-4", verdict.color)} />
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Result / Kết Quả</h4>
      </div>
      <h3 className={cn("text-2xl font-black uppercase tracking-tight mb-2", verdict.color)}>
        {verdict.title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed">
        {verdict.message}
      </p>
    </div>
  );
}
