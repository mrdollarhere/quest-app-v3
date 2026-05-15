/**
 * QuizIdentity.tsx
 * 
 * Purpose: Registration step for guest users to enter their callsign.
 * Features strict full-name validation and identity registry bridge.
 * Updated: v18.9.8 - Added Registry Quarantine (Lockout) after 3 failed attempts.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ListChecks, Clock, BarChart3, ArrowRight, LogIn, AlertCircle, Info, ShieldAlert, Timer } from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuizIdentityProps {
  guestName: string;
  setGuestName: (val: string) => void;
  onContinue: () => void;
  questionsCount: number;
  duration?: string;
}

// Registry Integrity Constants
const BANNED_TERMS = ['fuck', 'shit', 'asshole', 'bitch', 'admin', 'moderator', 'system', 'root', 'anonymous'];
const VIOLATION_THRESHOLD = 3;
const LOCKOUT_DURATION = 30; // Seconds

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const [error, setError] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // Lockout Timer Logic
  useEffect(() => {
    if (lockoutTime > 0) {
      timerRef.current = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockoutTime]);

  /**
   * IDENTITY INTEGRITY PROTOCOL v2.0
   * 
   * Detects and blocks:
   * 1. Single-word names (Requires Real Name format: 2+ words)
   * 2. Profanity blacklists
   * 3. Numeric-only strings
   * 4. Character repetition & pattern mashing
   * 5. High-entropy consonant clumps (Mash Detection)
   * 6. Phonetic invalidity (Vowel density)
   */
  const validateName = (name: string) => {
    const trimmed = name.trim();
    const normalized = trimmed.toLowerCase();
    const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
    const clean = normalized.replace(/\s+/g, '');
    
    // 1. Length & Word Count Protocol
    if (parts.length < 2) return "Please enter your full name (at least 2 words).";
    if (trimmed.length < 4) return "Callsign too short for registry.";
    
    // 2. Profanity Protocol
    if (BANNED_TERMS.some(term => normalized.includes(term))) {
      return "Inappropriate language detected.";
    }

    // 3. Numeric Protocol
    if (/[0-9]/.test(normalized)) return "Names should not contain numeric characters.";
    
    // 4. Character Diversity & Repetition Protocol
    const uniqueChars = new Set(clean.split('')).size;
    if (clean.length > 5 && uniqueChars < 3) return "Meaningless character input detected.";
    if (/(.)\1{2,}/.test(clean)) return "Character repetition detected.";
    
    // 5. Consonant Clump Protocol (Mash Detection)
    const consonantClump = /[^aeiouy\s\d]{5,}/i;
    if (consonantClump.test(normalized)) return "Irregular character sequence detected.";

    // 6. Phonetic Validity (Vowel Density)
    const vowels = (clean.match(/[aeiouy]/gi) || []).length;
    const density = vowels / clean.length;
    if (clean.length > 6 && density < 0.15) {
      return "Invalid phonetic structure (Mash detected).";
    }

    return null;
  };

  const handleBegin = () => {
    if (lockoutTime > 0) return;

    const validationError = validateName(guestName);
    if (validationError) {
      setError(validationError);
      
      const newCount = violationCount + 1;
      setViolationCount(newCount);
      
      if (newCount >= VIOLATION_THRESHOLD) {
        setLockoutTime(LOCKOUT_DURATION);
        setViolationCount(0); // Reset for next cycle
      }
      return;
    }
    setError(null);
    setViolationCount(0);
    onContinue();
  };

  const isLocked = lockoutTime > 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-blue-100">
          <ListChecks className="w-5 h-5 text-primary" />
          <p className="text-xl font-black">{questionsCount}</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Questions</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-indigo-100">
          <Clock className="w-5 h-5 text-indigo-600" />
          <p className="text-xl font-black">{duration || '15m'}</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Target</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-slate-200">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <p className="text-xl font-black">Standard</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Difficulty</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Operator Callsign</Label>
          {error && (
            <span className={cn(
              "text-[9px] font-bold uppercase flex items-center gap-1.5 animate-in slide-in-from-right-2",
              isLocked ? "text-amber-600" : "text-rose-500"
            )}>
              {isLocked ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} 
              {isLocked ? "Protocol Lockdown Active" : error}
            </span>
          )}
        </div>
        <div className="relative">
          <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", isLocked ? "text-rose-400" : "text-slate-300")} />
          <Input 
            placeholder={isLocked ? "REGISTRY QUARANTINE" : "E.G. John Doe"}
            value={guestName}
            disabled={isLocked}
            onChange={(e) => {
              setGuestName(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              "h-20 pl-14 rounded-2xl border-2 text-xl font-black transition-all",
              isLocked ? "bg-rose-50 border-rose-200 text-rose-300 cursor-not-allowed select-none" :
              error ? "border-rose-200 bg-rose-50/30 focus:ring-rose-500/20" : "border-slate-100 focus:ring-primary/20"
            )}
            onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
          />
        </div>
        <div className="flex items-start gap-3 px-2">
          {isLocked ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <p className={cn(
            "text-[10px] font-medium leading-relaxed italic",
            isLocked ? "text-rose-500 font-bold" : "text-slate-400"
          )}>
            {isLocked 
              ? `You have exceeded the violation threshold. Identity registry is frozen for safety.` 
              : "Please enter your full real name (at least 2 words). Keyboard mashing and inappropriate terms are restricted."}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <Button 
          onClick={handleBegin}
          disabled={!guestName.trim() || isLocked}
          className={cn(
            "w-full h-20 rounded-full text-2xl font-black uppercase tracking-tighter shadow-2xl transition-all border-none",
            isLocked ? "bg-rose-600 cursor-wait" : "bg-gradient-to-r from-primary to-indigo-600 text-white hover:scale-[1.02]"
          )}
        >
          {isLocked ? (
            <span className="flex items-center gap-3">
              <Timer className="w-6 h-6 animate-pulse" />
              Registry Locked: {lockoutTime}s
            </span>
          ) : (
            <>Begin Mission <ArrowRight className="w-6 h-6 ml-3" /></>
          )}
        </Button>

        {!isLocked && (
          <>
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">OR</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Button 
              variant="outline"
              onClick={() => router.push(`/login?returnTo=${encodeURIComponent(returnToUrl)}`)}
              className="w-full h-16 rounded-full border-2 border-slate-200 font-black text-sm uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              <LogIn className="w-4 h-4 mr-3" /> Access via Identity Registry
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
