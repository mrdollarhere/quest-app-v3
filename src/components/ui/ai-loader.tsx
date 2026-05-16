"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from '@/context/settings-context';
import { Progress } from "@/components/ui/progress";

/**
 * DNTRNG™ COGNITIVE TASK REGISTRY
 * Each phase is mapped to a strictly increasing target percentage.
 */
const AI_PHASES = [
  { text: "INITIALIZING ASSESSMENT PROTOCOL...", target: 12 },
  { text: "SCANNING RESPONSE TOPOLOGY FOR COGNITIVE PATTERNS...", target: 28 },
  { text: "EXECUTING HEURISTIC CROSS-VALIDATION ON ITEM MATRIX...", target: 45 },
  { text: "BENCHMARKING SEMANTIC DENSITY AGAINST RUBRIC MODELS...", target: 62 },
  { text: "CALCULATING PROBABILISTIC COMPETENCY QUOTIENT...", target: 78 },
  { text: "FINALIZING INTELLIGENCE REGISTRY LOGS...", target: 92 },
  { text: "MISSION STATUS: COMPLETE. READY FOR DISPATCH.", target: 100 }
];

interface AILoaderProps {
  className?: string;
  iconClassName?: string;
  showBrand?: boolean;
  messages?: string[]; // Preserved for legacy support
  onComplete?: () => void; // Sequence dispatcher callback
}

/**
 * DNTRNG™ COGNITIVE EVALUATION ENGINE
 * 
 * Implements a strictly monotonic progress tracker with linear interpolation
 * across a sequential task matrix. Ensures full visual minimum is met.
 * Optimized Velocity: 4s total duration.
 */
export function AILoader({ 
  className, 
  iconClassName,
  showBrand = false,
  onComplete
}: AILoaderProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { settings } = useSettings();
  const hasFinished = useRef(false);

  const brandName = String(settings?.platform_name || "DNTRNG");

  useEffect(() => {
    const totalDuration = 4000; // Visual Minimum: 4s (Optimized from 6s)
    const startTime = performance.now();
    let animationFrame: number;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min((elapsed / totalDuration) * 100, 100);
      
      // MONOTONIC PROTOCOL: Ensure progress never moves backward
      setProgress(prev => Math.max(prev, rawProgress));

      // PHASE SYNCHRONIZATION: Map raw progress to current task index
      const newIndex = AI_PHASES.findIndex((p, i) => {
        const nextTarget = AI_PHASES[i + 1]?.target || 101;
        return rawProgress < nextTarget;
      });

      if (newIndex !== -1 && newIndex !== index) {
        setIndex(newIndex);
      }

      if (rawProgress >= 100) {
        setProgress(100);
        setIndex(AI_PHASES.length - 1);
        
        // Finalize Protocol: Trigger onComplete after a brief "Hold" period
        if (!hasFinished.current) {
          hasFinished.current = true;
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
        return;
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [index, onComplete]);

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

      <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
        {/* Pulsing Aura Protocol - Replaces Legacy Spinner */}
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
        <div className="absolute inset-2 bg-primary/5 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-center justify-center">
          <Sparkles className={cn("w-12 h-12 text-primary animate-pulse drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]", iconClassName)} />
        </div>
      </div>
      
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2 min-h-[40px]">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white transition-all duration-500 leading-relaxed">
            {AI_PHASES[index]?.text}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full bg-primary",
              progress < 100 && "animate-pulse"
            )} />
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {progress === 100 ? "Optimization Complete" : "Evaluation in progress"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Mission Status</span>
            <span className="text-xs font-black tabular-nums text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-1 bg-slate-100 dark:bg-slate-800 rounded-none border-none transition-all duration-300" 
          />
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
