
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from '@/context/settings-context';

interface AILoaderProps {
  className?: string;
  iconClassName?: string;
  showBrand?: boolean;
  isDataReady?: boolean; 
  onComplete?: () => void; 
}

/**
 * DNTRNG™ STATE-LINKED EVALUATION ENGINE
 * 
 * Implements a network-aware state machine for progress tracking.
 * Logic:
 * 1. REQUEST_SENT: 0% -> 30%
 * 2. DATA_AWAITING: 30% -> 75% (Slow Coast)
 * 3. DATA_RESOLVED: 75% -> 100% (Rapid Snap on isDataReady)
 */
export function AILoader({ 
  className, 
  iconClassName,
  showBrand = false,
  isDataReady = false,
  onComplete
}: AILoaderProps) {
  const [visualProgress, setVisualProgress] = useState(0);
  const [isSlow, setIsSlow] = useState(false);
  const { settings } = useSettings();
  const brandName = String(settings?.platform_name || "DNTRNG");
  
  const startTimeRef = useRef(Date.now());
  const hasTriggeredComplete = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisualProgress(prev => {
        if (prev < 30) {
          return Math.min(30, prev + 3); // Faster ramp-up
        }
        
        if (!isDataReady) {
          if (Date.now() - startTimeRef.current > 3000) {
            setIsSlow(true);
          }
          
          if (prev < 75) {
            return prev + 0.5; // Slightly faster coast
          }
          return prev;
        }

        // isDataReady is TRUE: Rapid resolution protocol
        if (prev < 100) {
          return Math.min(100, prev + 15); // Instant snap to 100%
        }

        return 100;
      });
    }, 40); // 40ms interval for smoother 25fps pulse

    return () => clearInterval(timer);
  }, [isDataReady]);

  // NAVIGATION GUARD: Trigger onComplete immediately upon 100% visual parity
  useEffect(() => {
    if (visualProgress >= 100 && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      // No artificial hold - immediate transition per operator feedback
      onComplete?.();
    }
  }, [visualProgress, onComplete]);

  const getTelemetryPhrase = () => {
    if (visualProgress === 100) return "MISSION STATUS: 100%";
    if (visualProgress >= 85) return "INTELLIGENCE RECEIVED. VALIDATING CHECKSUM...";
    if (isSlow) return "OPTIMIZING PACKET FRAGMENTS...";
    return "INITIALIZING DATA UPLINK...";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      {showBrand && (
        <div className="mb-16 flex flex-col items-center animate-in fade-in zoom-in duration-700">
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
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
        <div className="absolute inset-2 bg-primary/5 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-center justify-center">
          <Sparkles className={cn("w-12 h-12 text-primary animate-pulse drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]", iconClassName)} />
        </div>
      </div>
      
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2 min-h-[40px]">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white transition-all duration-500 leading-relaxed">
            {getTelemetryPhrase()}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full bg-primary",
              visualProgress < 100 && "animate-pulse"
            )} />
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {visualProgress === 100 ? "Optimization Complete" : "Evaluation in progress"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Mission Status</span>
            <span className="text-xs font-black tabular-nums text-primary">{Math.round(visualProgress)}%</span>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-primary"
               style={{ 
                 width: `${visualProgress}%`,
                 transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
               }}
             />
          </div>
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
