"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeLeft: number;
}

// Memoized to prevent cascading re-renders on each tick
export const QuizTimer = React.memo(({ timeLeft }: QuizTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular timer calculation
  const totalSessionTime = 900; // 15m base for visual progress
  const dashArray = 2 * Math.PI * 18;
  const dashOffset = dashArray - (dashArray * (timeLeft / totalSessionTime));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeLabel = `Time remaining: ${minutes} minutes ${seconds} seconds`;

  return (
    <div 
      className="relative flex items-center justify-center w-14 h-14 shrink-0" 
      role="timer" 
      aria-label={timeLabel}
      aria-live="off"
    >
      <svg className="w-full h-full -rotate-90" aria-hidden="true">
        <circle
          cx="28"
          cy="28"
          r="18"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="28"
          cy="28"
          r="18"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          className={cn("text-primary transition-all duration-1000", timeLeft < 60 && "text-destructive")}
        />
      </svg>
      <span className={cn(
        "absolute text-[10px] font-black tracking-tighter",
        timeLeft < 60 ? "text-destructive" : "text-slate-900"
      )}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
});

QuizTimer.displayName = 'QuizTimer';
