/**
 * QuizIdentity.tsx
 * 
 * Purpose: Registration step for guest users to enter their callsign.
 * Used by: src/components/quiz/QuizStart.tsx
 * Props:
 *   - guestName: string — current name input
 *   - setGuestName: (val: string) => void — state dispatcher
 *   - onContinue: () => void — proceed to mode selection
 *   - questionsCount: number — module metadata
 *   - duration: string — module metadata
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ListChecks, Clock, BarChart3, ArrowRight } from 'lucide-react';

interface QuizIdentityProps {
  guestName: string;
  setGuestName: (val: string) => void;
  onContinue: () => void;
  questionsCount: number;
  duration?: string;
}

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
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
        <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Operator Callsign</Label>
        <div className="relative">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <Input 
            placeholder="Enter full name for registry..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="h-18 pl-14 rounded-2xl border-2 text-xl font-black"
          />
        </div>
      </div>
      <Button 
        onClick={onContinue}
        disabled={!guestName.trim()}
        className="w-full h-20 rounded-full text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 text-white uppercase tracking-tighter shadow-2xl"
      >
        Begin Mission <ArrowRight className="w-6 h-6 ml-3" />
      </Button>
    </div>
  );
}
