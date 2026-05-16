"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from '@/context/settings-context';

const DEFAULT_MESSAGES = [
  "Thinking...",
  "Analyzing...",
  "Generating response...",
  "Synchronizing registry...",
  "Calibrating assessment nodes...",
  "Optimizing intelligence pathways..."
];

interface AILoaderProps {
  messages?: string[];
  className?: string;
  iconClassName?: string;
  showBrand?: boolean;
}

export function AILoader({ 
  messages = DEFAULT_MESSAGES, 
  className, 
  iconClassName,
  showBrand = false
}: AILoaderProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const { settings } = useSettings();

  const brandName = String(settings?.platform_name || "DNTRNG");

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 500); // Time for fade out
    }, 2500); // Rotation speed

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {showBrand && (
        <div className="mb-12 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
           {settings?.logo_url ? (
             <img 
               src={settings.logo_url} 
               alt={brandName} 
               className="h-12 w-auto mb-4 grayscale opacity-20 dark:invert dark:opacity-10" 
               onError={(e) => (e.currentTarget.style.display = 'none')}
             />
           ) : (
             <h1 className="text-4xl font-black text-slate-100 dark:text-slate-900 uppercase tracking-[0.6em] mb-4 select-none">
               {brandName}
             </h1>
           )}
           <div className="h-px w-24 bg-slate-100 dark:bg-slate-900/50" />
        </div>
      )}

      <div className="relative w-16 h-16 mb-8">
        <Loader2 className={cn("w-16 h-16 animate-spin text-primary absolute top-0 left-0 stroke-[3px]", iconClassName)} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      
      <p className={cn(
        "text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}>
        {messages[index]}
      </p>

      {showBrand && (
        <p className="mt-20 text-[8px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-[0.8em] select-none">
          Intelligence Registry Protocol
        </p>
      )}
    </div>
  );
}
