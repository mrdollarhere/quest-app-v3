/**
 * QuizIdentity.tsx
 * 
 * Purpose: Registration step for guest users to enter their callsign.
 * Features strict full-name validation and identity registry bridge.
 * Updated: v19.0.8 - Dynamic Lockdown Duration via Registry Settings.
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  ListChecks, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  LogIn, 
  AlertCircle, 
  ShieldAlert, 
  Timer
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';

// Registry Integrity Constants
const BANNED_TERMS = ['fuck', 'shit', 'asshole', 'bitch', 'admin', 'moderator', 'system', 'root', 'anonymous', 'stfu', 'fck'];
const VIOLATION_THRESHOLD = 3;
const PERSISTENCE_KEY = 'dntrng_terminal_lockdown_expiry';

interface QuizIdentityProps {
  guestName: string;
  setGuestName: (val: string) => void;
  onContinue: () => void;
  questionsCount: number;
  duration?: string;
}

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const { settings } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Registry Lockout Calibration
  const lockdownDurationSeconds = useMemo(() => {
    const mins = Number(settings.registry_lockdown_duration || '30');
    return mins * 60;
  }, [settings.registry_lockdown_duration]);

  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // PERSISTENCE PROTOCOL: Restore ban from registry on mount
  useEffect(() => {
    const savedExpiry = localStorage.getItem(PERSISTENCE_KEY);
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutTime(remaining);
      } else {
        localStorage.removeItem(PERSISTENCE_KEY);
      }
    }
  }, []);

  // TERMINAL LOCKDOWN EFFECT: Block interaction
  useEffect(() => {
    if (lockoutTime > 0) {
      // 1. Keyboard Suppression
      const blockKeys = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // 2. Scroll Suppression
      document.body.style.overflow = 'hidden';
      document.body.style.cursor = 'none';

      window.addEventListener('keydown', blockKeys, { capture: true });
      
      timerRef.current = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            localStorage.removeItem(PERSISTENCE_KEY);
            document.body.style.overflow = 'auto';
            document.body.style.cursor = 'default';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        window.removeEventListener('keydown', blockKeys, { capture: true });
        document.body.style.overflow = 'auto';
        document.body.style.cursor = 'default';
      };
    }
  }, [lockoutTime]);

  /**
   * IDENTITY INTEGRITY PROTOCOL v3.0
   */
  const validateName = (name: string) => {
    const trimmed = name.trim();
    const normalized = trimmed.toLowerCase();
    const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
    const clean = normalized.replace(/\s+/g, '');
    
    // 1. Structure Protocol
    if (parts.length < 2) return "Please enter your full name (at least 2 words).";
    if (trimmed.length < 4) return "Callsign too short for registry.";
    
    // 2. Profanity Shield
    if (BANNED_TERMS.some(term => normalized.includes(term))) {
      return "Inappropriate language detected.";
    }

    // 3. Numeric Suppression
    if (/[0-9]/.test(normalized)) return "Names should not contain numeric characters.";
    
    // 4. Entropy Guard
    const uniqueChars = new Set(clean.split('')).size;
    if (clean.length > 5 && uniqueChars < 3) return "Meaningless character input detected.";
    if (/(.)\1{2,}/.test(clean)) return "Character repetition detected.";
    
    // 5. Consonant Clump Guard (Mash Detection)
    const consonantClump = /[^aeiouy\s\d]{5,}/i;
    if (consonantClump.test(normalized)) return "Irregular character sequence detected.";

    // 6. Phonetic Validity
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
        const expiry = Date.now() + lockdownDurationSeconds * 1000;
        localStorage.setItem(PERSISTENCE_KEY, expiry.toString());
        setLockoutTime(lockdownDurationSeconds);
        setViolationCount(0);
      }
      return;
    }
    setError(null);
    setViolationCount(0);
    onContinue();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLocked = lockoutTime > 0;

  return (
    <>
      {/* FULL SCREEN LOCKDOWN OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="max-w-md w-full space-y-12">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-24 h-24 bg-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/40">
                <ShieldAlert className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                Terminal Locked
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest">
                Registry Integrity Violation Detected
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                Your student node has been forensicallly quarantined for {Math.round(lockdownDurationSeconds / 60)} minutes due to repeated validation failures. Access to the intelligence registry is strictly prohibited.
              </p>
            </div>

            <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Time Remaining</p>
                <p className="text-6xl font-black text-white tabular-nums tracking-tighter">
                  {formatTime(lockoutTime)}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Timer className="w-4 h-4 text-rose-500 animate-spin" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">Protocol Active</span>
              </div>
            </div>

            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.6em]">
              Security Protocol v19.0.0 — DNTRNG™
            </p>
          </div>
        </div>
      )}

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

        {/* HIGHLIGHTED INSTRUCTIONAL NODE */}
        <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] flex items-start gap-5 shadow-sm animate-in zoom-in-95 duration-500">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-amber-700 tracking-[0.2em] leading-none">Registry Entry Guide</h4>
            <p className="text-xs font-bold text-amber-900/80 leading-relaxed">
              To initialize your session, you must input your <span className="text-amber-600 font-black underline underline-offset-4">Full Real Name</span> (minimum 2 words).
            </p>
            <div className="pt-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-400" />
                <p className="text-[9px] font-bold text-amber-700/70 uppercase">No random keyboard mashing allowed</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-rose-400" />
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">
                  CONSEQUENCE: 3 Failures = {Math.round(lockdownDurationSeconds / 60)}-Minute Platform Lockdown
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Operator Callsign</Label>
            {error && (
              <span className="text-[9px] font-bold uppercase flex items-center gap-1.5 animate-in slide-in-from-right-2 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}
          </div>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-slate-300" />
            <Input 
              placeholder="E.G. John Doe"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (error) setError(null);
              }}
              className={cn(
                "h-20 pl-14 rounded-2xl border-2 text-xl font-black transition-all",
                error ? "border-rose-200 bg-rose-50/30 focus:ring-rose-500/20" : "border-slate-100 focus:ring-primary/20"
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
            />
          </div>
        </div>

        <div className="space-y-5">
          <Button 
            onClick={handleBegin}
            disabled={!guestName.trim()}
            className="w-full h-20 rounded-full text-2xl font-black uppercase tracking-tighter shadow-2xl transition-all border-none bg-gradient-to-r from-primary to-indigo-600 text-white hover:scale-[1.02]"
          >
            Begin Mission <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

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
        </div>
      </div>
    </>
  );
}
