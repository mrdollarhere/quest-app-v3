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

  const [titleEn, titleVi] = verdict.title.split(' / ');
  const [msgEn, msgVi] = verdict.message.split(' / ');

  return (
    <div className={cn(
      "flex-1 p-8 rounded-[2rem] border-l-[6px] transition-all duration-500",
      verdict.border,
      verdict.bg
    )}>
      <div className="flex items-center gap-3 mb-4">
        <VerdictIcon className={cn("w-4 h-4", verdict.color)} />
        <div className="leading-none">
          <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Result</span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400/80 mt-0.5">Kết Quả</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className={cn("text-2xl font-black uppercase tracking-tight leading-none", verdict.color)}>
            {titleEn}
          </h3>
          {titleVi && (
            <p className={cn("text-lg font-bold uppercase tracking-tight opacity-70 leading-none", verdict.color)}>
              {titleVi}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-slate-700 dark:text-slate-300 font-medium text-base leading-relaxed">
            {msgEn}
          </p>
          {msgVi && (
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed italic">
              {msgVi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
