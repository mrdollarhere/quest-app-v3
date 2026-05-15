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
const BANNED_TERMS = ['fuck', 'shit', 'asshole', 'bitch', 'admin', 'moderator', 'system', 'root'];

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  const validateName = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    
    // Length Protocol
    if (trimmed.length < 2) return "Callsign must be at least 2 characters.";
    
    // Profanity Protocol
    if (BANNED_TERMS.some(term => trimmed.includes(term))) {
      return "Inappropriate language detected. Please use a professional callsign.";
    }

    // Gibberish Protocol: Numeric only
    if (/^[0-9\s]+$/.test(trimmed)) return "Callsign cannot consist only of numeric nodes.";
    
    // Gibberish Protocol: Repeating characters (e.g. "aaaaa")
    if (/^(.)\1{2,}$/.test(trimmed)) return "Meaningless character repetition detected.";
    
    // Gibberish Protocol: No vowels (if long enough)
    if (trimmed.length > 5 && !/[aeiouy]/.test(trimmed) && !trimmed.includes(' ')) {
      return "Please enter a recognizable name.";
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
          {error && <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</span>}
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
              error ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
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
