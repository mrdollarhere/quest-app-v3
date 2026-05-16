"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from '@/context/settings-context';
import { Progress } from "@/components/ui/progress";

const DEFAULT_MESSAGES = [
  "Establishing Neural Handshake...",
  "Synchronizing Registry Nodes...",
  "Aggregating Intelligence Data...",
  "Calculating Precision Coefficients...",
  "Verifying Mission Integrity...",
  "Synchronizing Neural Pathways..."
];

interface AILoaderProps {
  messages?: string[];
  className?: string;
  iconClassName?: string;
  showBrand?: boolean;
  isSequential?: boolean;
}

/**
 * DNTRNG™ COGNITIVE EVALUATION ENGINE
 * 
 * Simulated AI processing node with sequential phase triggering 
 * and dynamic progress tracking.
 */
export function AILoader({ 
  messages = DEFAULT_MESSAGES, 
  className, 
  iconClassName,
  showBrand = false,
  isSequential = true
}: AILoaderProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { settings } = useSettings();

  const brandName = String(settings?.platform_name || "DNTRNG");

  // PROGRESS CALIBRATION PROTOCOL
  useEffect(() => {
    if (!isSequential) return;

    // Phase transition timing
    const phaseDuration = 2000; // 2s per message
    const totalDuration = messages.length * phaseDuration;
    
    let startTime = Date.now();
    
    const updateLoop = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / totalDuration) * 100, 99);
      
      // Map progress to message index
      const newIndex = Math.floor((currentProgress / 100) * messages.length);
      
      setProgress(currentProgress);
      if (newIndex < messages.length) {
        setIndex(newIndex);
      }
    }, 50);

    return () => clearInterval(updateLoop);
  }, [messages, isSequential]);

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      {showBrand && (
        <div className="mb-16 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
           {settings?.logo_url ? (
             <img 
               src={settings.logo_url} 
               alt={brandName} 
               className="h-10 w-auto mb-6 grayscale opacity-30 dark:invert dark:opacity-20" 
               onError={(e) => (e.currentTarget.style.display = 'none')}
             />
           ) : (
             <h1 className="text-3xl font-black text-slate-100 dark:text-slate-900 uppercase tracking-[0.8em] mb-6 select-none">
               {brandName}
             </h1>
           )}
           <div className="h-px w-32 bg-slate-100 dark:bg-slate-900/50" />
        </div>
      )}

      <div className="relative w-20 h-20 mb-12">
        <Loader2 className={cn("w-20 h-20 animate-spin text-primary absolute top-0 left-0 stroke-[3px] opacity-20", iconClassName)} />
        <Loader2 className={cn("w-20 h-20 animate-spin text-primary absolute top-0 left-0 stroke-[3px] transition-all duration-1000")} style={{ clipPath: `inset(${100-progress}% 0 0 0)` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white h-4 transition-all duration-500">
            {messages[index]}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Evaluation in progress
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Mission Status</span>
            <span className="text-xs font-black tabular-nums text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-slate-100 dark:bg-slate-800 rounded-none border-none" />
        </div>
      </div>

      {showBrand && (
        <p className="mt-24 text-[8px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-[1em] select-none">
          Intelligence Registry Protocol
        </p>
      )}
    </div>
  );
}
