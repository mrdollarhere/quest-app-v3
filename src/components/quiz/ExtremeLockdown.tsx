
/**
 * ExtremeLockdown.tsx
 * 
 * Route: Internal Component
 * Purpose: Forensic interaction barrier for quarantined student nodes.
 * Features: Fullscreen enforcement, global key/mouse blocking, and bilingual diagnostics.
 */

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Timer, Lock, ShieldX, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtremeLockdownProps {
  isLocked: boolean;
  lockoutTime: number;
  reason: { en: string; vi: string };
  onUnlock: () => void;
}

export function ExtremeLockdown({ isLocked, lockoutTime, reason, onUnlock }: ExtremeLockdownProps) {
  const [showFullscreenNotice, setShowFullscreenNotice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLocked) return;

    // 1. FULLSCREEN PROTOCOL
    const enterFullscreen = () => {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            setShowFullscreenNotice(true);
          });
        }
      } catch (e) {}
    };

    // Trigger on mount
    enterFullscreen();

    // 2. INTERACTION SUPPRESSION PROTOCOL
    const suppress = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block ALL keys
      e.preventDefault();
      e.stopImmediatePropagation();

      // Forensic Log bypass attempts
      if (e.key === 'F12' || e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        console.warn('[Security] Bypass shortcut suppressed.');
      }
      return false;
    };

    // Apply Global Listeners
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('mousedown', suppress, true);
    window.addEventListener('mouseup', suppress, true);
    window.addEventListener('click', suppress, true);
    window.addEventListener('contextmenu', suppress, true);
    window.addEventListener('wheel', suppress, { capture: true, passive: false });
    window.addEventListener('selectstart', suppress, true);

    // Disable Body Interaction
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mousedown', suppress, true);
      window.removeEventListener('mouseup', suppress, true);
      window.removeEventListener('click', suppress, true);
      window.removeEventListener('contextmenu', suppress, true);
      window.removeEventListener('wheel', suppress, true);
      window.removeEventListener('selectstart', suppress, true);
      
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
      document.body.style.userSelect = 'auto';

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isLocked]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLocked) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center select-none cursor-none animate-in fade-in duration-500"
      style={{ pointerEvents: 'auto' }} // Allow interaction on the overlay itself if needed, but we block it globally
    >
      <div className="max-w-2xl w-full space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="relative w-28 h-24 mx-auto">
             <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-20">
               <ShieldX className="w-24 h-24 text-rose-500" />
             </div>
             <div className="relative w-24 h-24 bg-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(244,63,94,0.4)]">
               <ShieldAlert className="w-12 h-12 text-white animate-bounce" />
             </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-xs font-black uppercase tracking-[0.3em] shadow-inner">
            <Terminal className="w-4 h-4" />
            Registry Integrity Violation
          </div>
          
          <div className="space-y-2">
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              TERMINAL LOCKED
            </h2>
            <p className="text-xl font-bold text-rose-400 uppercase tracking-widest">
              NÚT SINH VIÊN BỊ CÁCH LY
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
             <p className="text-slate-400 font-medium leading-relaxed text-sm">
               {reason.en}
             </p>
             <div className="h-px w-12 bg-white/10 mx-auto" />
             <p className="text-slate-500 font-medium leading-relaxed text-sm italic">
               {reason.vi}
             </p>
          </div>
        </div>

        <div className="relative p-12 bg-slate-900 border-2 border-white/5 rounded-[3.5rem] shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/30 overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(lockoutTime / 2700) * 100}%` }} // Adjusted to 45m max
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em] mb-2">Registry Reset In</p>
            <p className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {formatTime(lockoutTime)}
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Timer className="w-5 h-5 text-rose-500 animate-spin" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Protocol Active</span>
            </div>
          </div>
        </div>

        {showFullscreenNotice && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 animate-in slide-in-from-bottom-4">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">
              Operator: Manual Fullscreen Handshake Required [Press F11]
            </p>
          </div>
        )}

        <div className="pt-8 flex flex-col items-center gap-4 opacity-30">
          <Lock className="w-6 h-6 text-slate-500" />
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.8em]">
            DNTRNG™ SECURITY NODE V19.2
          </p>
        </div>
      </div>
    </div>
  );
}
