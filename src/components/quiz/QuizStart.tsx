
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  ChevronRight, 
  User as UserIcon, 
  Zap, 
  Gamepad2, 
  Target, 
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw
} from "lucide-react";
import { QuizMode } from '@/types/quiz';
import { cn } from "@/lib/utils";

interface QuizStartProps {
  title: string;
  description?: string;
  questionsCount: number;
  duration?: string;
  user: any;
  guestName: string;
  setGuestName: (name: string) => void;
  onStart: (mode: QuizMode) => void;
}

export function QuizStart({
  title,
  description,
  questionsCount,
  duration,
  user,
  guestName,
  setGuestName,
  onStart
}: QuizStartProps) {
  const [step, setStep] = useState<'identity' | 'mode'>(user ? 'mode' : 'identity');
  const [selectedMode, setSelectedMode] = useState<QuizMode>('test');

  const modes = [
    {
      id: 'training' as QuizMode,
      title: 'Training',
      icon: Gamepad2,
      desc: 'No pressure. Practice at your own pace with instant feedback.',
      features: ['Unlimited Time', 'Instant Feedback', 'Retries Allowed'],
      color: 'blue'
    },
    {
      id: 'test' as QuizMode,
      title: 'Test',
      icon: Target,
      desc: 'Standard protocol. Fixed time limit. No feedback until the end.',
      features: ['Fixed Timer', 'Final Score Only', 'One Attempt'],
      color: 'primary'
    },
    {
      id: 'race' as QuizMode,
      title: 'Race',
      icon: Flame,
      desc: 'High stakes. Speed & accuracy. One mistake and you start over.',
      features: ['Speed Focus', 'Permadeath Reset', 'Streak Tracking'],
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="h-3 bg-primary" />
        
        <CardHeader className="text-center pt-12 pb-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 rotate-3">
            <Zap className="w-10 h-10 text-primary fill-current" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase text-slate-900">{title}</CardTitle>
          <CardDescription className="text-lg font-medium text-slate-500 mt-2">
            {step === 'identity' ? (description || 'Ready to initialize intelligence?') : 'Select Initialization Protocol'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          {step === 'identity' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-6 py-6 border-y border-slate-50">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900">{questionsCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Steps</p>
                </div>
                <div className="w-px h-12 bg-slate-100" />
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900">{duration || '15m'}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target</p>
                </div>
              </div>

              <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                <Label htmlFor="guestName" className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 ml-1">Identity Provider</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <Input 
                    id="guestName"
                    placeholder="Enter full name for registry..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-16 pl-12 rounded-2xl bg-white border-none ring-1 ring-slate-100 focus:ring-primary/40 text-lg font-bold"
                  />
                </div>
              </div>

              <Button 
                onClick={() => guestName.trim() ? setStep('mode') : null}
                disabled={!guestName.trim()}
                className="w-full h-20 rounded-full text-xl font-black shadow-2xl transition-all hover:scale-[1.02] bg-slate-900 uppercase tracking-tighter"
              >
                Proceed to Mode Selection
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      "flex flex-col p-6 rounded-[2rem] border-4 transition-all text-left relative group overflow-hidden",
                      selectedMode === mode.id 
                        ? "border-primary bg-primary/5 shadow-xl scale-105 z-10" 
                        : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                      selectedMode === mode.id ? "bg-primary text-white" : "bg-white text-slate-400 shadow-sm"
                    )}>
                      <mode.icon className="w-6 h-6" />
                    </div>
                    <h3 className={cn("text-xl font-black uppercase tracking-tighter mb-2", selectedMode === mode.id ? "text-primary" : "text-slate-900")}>
                      {mode.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6">{mode.desc}</p>
                    
                    <div className="space-y-2">
                      {mode.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={cn("w-3 h-3", selectedMode === mode.id ? "text-primary" : "text-slate-300")} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f}</span>
                        </div>
                      ))}
                    </div>

                    {selectedMode === mode.id && (
                      <div className="absolute top-4 right-4 animate-in zoom-in-50">
                        <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  {selectedMode === 'training' && <Gamepad2 className="w-32 h-32" />}
                  {selectedMode === 'test' && <Target className="w-32 h-32" />}
                  {selectedMode === 'race' && <Flame className="w-32 h-32" />}
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Protocol Ready</p>
                    <h4 className="text-2xl font-black uppercase tracking-tight">
                      Initialize {selectedMode} Mode
                    </h4>
                    <p className="text-sm text-slate-400 font-medium">
                      {selectedMode === 'training' && "Master the content with no time constraints."}
                      {selectedMode === 'test' && "Simulate a real-world assessment environment."}
                      {selectedMode === 'race' && "Test your speed. Precision is mandatory."}
                    </p>
                  </div>
                  <Button 
                    onClick={() => onStart(selectedMode)}
                    className="h-16 px-12 rounded-full bg-primary font-black text-lg shadow-2xl hover:scale-110 transition-all shrink-0"
                  >
                    Start Intelligence
                    <Play className="w-5 h-5 ml-3 fill-current" />
                  </Button>
                </div>
              </div>

              <button 
                onClick={() => setStep('identity')}
                className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors"
              >
                Change Identity Registry
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
