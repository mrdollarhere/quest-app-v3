"use client";

import React, { useRef } from 'react';
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeLeft: number;
}

/**
 * DNTRNG™ DYNAMIC TEMPORAL GAUGE
 * 
 * Renders a circular countdown indicator.
 * Logic: Captures the initial duration on mount to ensure the progress 
 * ring starts at 100% regardless of the total mission time.
 */
export const QuizTimer = React.memo(({ timeLeft }: QuizTimerProps) => {
  // Registry Protocol: Capture the starting duration for visual scaling
  const initialDurationRef = useRef<number | null>(null);
  
  if (initialDurationRef.current === null && timeLeft > 0) {
    initialDurationRef.current = timeLeft;
  }

  // Fallback to 1s to prevent division-by-zero errors in the registry pulse
  const totalSessionTime = initialDurationRef.current || timeLeft || 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular timer calculation: Scaled relative to the actual mission length
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
          className={cn(
            "text-primary transition-all duration-1000 ease-linear", 
            timeLeft < 60 && "text-destructive"
          )}
        />
      </svg>
      <span className={cn(
        "absolute text-[10px] font-black tracking-tighter tabular-nums",
        timeLeft < 60 ? "text-destructive" : "text-slate-900"
      )}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
});

QuizTimer.displayName = 'QuizTimer';
