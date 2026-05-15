/**
 * QuizIdentity.tsx
 * 
 * Purpose: Registration step for guest users to enter their callsign.
 * Features Call-sign validation and identity registry bridge.
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ListChecks, Clock, BarChart3, ArrowRight, LogIn, AlertCircle } from 'lucide-react';
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

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  /**
   * IDENTITY INTEGRITY PROTOCOL
   * 
   * Detects and blocks:
   * 1. Profanity
   * 2. Numeric-only strings
   * 3. Character repetition (e.g. "aaaaa")
   * 4. Consonant clumps (e.g. "sdfgh")
   * 5. Pattern mashing (e.g. "sbsbsb")
   * 6. Low vowel density (phonetic invalidity)
   */
  const validateName = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    const clean = trimmed.replace(/\s+/g, '');
    
    // 1. Length Protocol
    if (trimmed.length < 2) return "Callsign must be at least 2 characters.";
    
    // 2. Profanity Protocol
    if (BANNED_TERMS.some(term => trimmed.includes(term))) {
      return "Inappropriate language detected.";
    }

    // 3. Numeric Protocol
    if (/^[0-9\s]+$/.test(trimmed)) return "Callsign cannot be numeric only.";
    
    // 4. Repetition Protocol
    if (/^(.)\1{2,}$/.test(clean)) return "Meaningless character repetition detected.";
    
    // 5. Consonant Clump Protocol (Mash Detection)
    // Block more than 4 consecutive consonants (rare in most languages for first names)
    const consonantClump = /[^aeiouy\s\d]{5,}/i;
    if (consonantClump.test(trimmed)) return "Irregular character sequence (mash) detected.";

    // 6. Pattern Mash Detector (Repeating bigrams)
    if (clean.length > 8) {
      const bigramCounts: Record<string, number> = {};
      for (let i = 0; i < clean.length - 1; i++) {
        const b = clean.substring(i, i + 2);
        bigramCounts[b] = (bigramCounts[b] || 0) + 1;
      }
      const maxRep = Math.max(...Object.values(bigramCounts), 0);
      if (maxRep > 2) return "Patterned keyboard input detected.";
    }

    // 7. Vowel Density Protocol (Phonetic Validity)
    // Most names have at least 20% vowels (e.g. "Trinh" is 20%, "Nguyen" is 50%)
    if (clean.length > 5) {
      const vowels = (clean.match(/[aeiouy]/gi) || []).length;
      const density = vowels / clean.length;
      if (density < 0.20 && !trimmed.includes(' ')) {
        return "Callsign does not appear to be a valid name.";
      }
    }

    return null;
  };

  const handleBegin = () => {
    const validationError = validateName(guestName);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onContinue();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" />
          <p className="text-xl font-black">{questionsCount}</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Questions</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <p className="text-xl font-black">{duration || '15m'}</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Target</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <p className="text-xl font-black">Standard</p>
          <p className="text-[9px] font-black uppercase text-slate-400">Difficulty</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Operator Callsign</Label>
          {error && (
            <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1.5 animate-in slide-in-from-right-2">
              <AlertCircle className="w-3.5 h-3.5" /> 
              {error}
            </span>
          )}
        </div>
        <div className="relative">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <Input 
            placeholder="Enter full name for registry..."
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              "h-18 pl-14 rounded-2xl border-2 text-xl font-black transition-all",
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
          className="w-full h-20 rounded-full text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 text-white uppercase tracking-tighter shadow-2xl transition-all hover:scale-[1.02]"
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
          className="w-full h-16 rounded-full border-2 border-slate-200 font-black text-sm uppercase tracking-widest text-slate-600 hover:bg-slate-50"
        >
          <LogIn className="w-4 h-4 mr-3" /> Access via Identity Registry
        </Button>
      </div>
    </div>
  );
}
