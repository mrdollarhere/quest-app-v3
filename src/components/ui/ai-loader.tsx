"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function AILoader({ 
  messages = DEFAULT_MESSAGES, 
  className, 
  iconClassName 
}: AILoaderProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
    </div>
  );
}
