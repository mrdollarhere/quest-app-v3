
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
  Lock,
  ShieldCheck
} from "lucide-react";
import { QuizMode } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { generateDailyPassword } from '@/lib/security-utils';
import { useToast } from '@/hooks/use-toast';

interface QuizStartProps {
  title: string;
  description?: string;
  questionsCount: number;
  duration?: string;
  user: any;
  guestName: string;
  setGuestName: (name: string) => void;
  protocolSalt?: string;
  isProtectionEnabled?: boolean;
  onStart: (mode: QuizMode) => void;
}

type Step = 'gate' | 'identity' | 'mode';

export function QuizStart({
  title,
  description,
  questionsCount,
  duration,
  user,
  guestName,
  setGuestName,
  protocolSalt,
  isProtectionEnabled = true,
  onStart
}: QuizStartProps) {
  const [step, setStep] = useState<Step>(isProtectionEnabled ? 'gate' : (user ? 'mode' : 'identity'));
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<QuizMode>('test');
  const { toast } = useToast();

  const handleVerifyPassword = () => {
    const dailyKey = generateDailyPassword(undefined, protocolSalt);
    if (password.trim().toUpperCase() === dailyKey.toUpperCase()) {
      toast({
        title: "Access Granted",
        description: "Security Protocol Cleared. Please proceed with identity registration.",
      });
      setStep(user ? 'mode' : 'identity');
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The daily security key provided is invalid for this node.",
      });
    }
  };

  const modes = [
    {
      id: 'training' as QuizMode,
      title: 'Practice',
      icon: Gamepad2,
      desc: 'No time limit, instant feedback',
      colorClass: 'bg-green-500 shadow-green-500/20',
      textClass: 'text-green-600',
      btnClass: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'test' as QuizMode,
      title: 'Test',
      icon: Target,
      desc: 'Timed, score revealed at the end',
      colorClass: 'bg-primary shadow-primary/20',
      textClass: 'text-primary',
      btnClass: 'bg-primary hover:bg-primary/90'
    },
    {
      id: 'race' as QuizMode,
      title: 'Race',
      icon: Flame,
      desc: 'Speed & accuracy, one attempt',
      colorClass: 'bg-orange-500 shadow-orange-500/20',
      textClass: 'text-orange-600',
      btnClass: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const currentModeInfo = modes.find(m => m.id === selectedMode);

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
            {step === 'gate' && 'Security Protocol Required'}
            {step === 'identity' && (description || 'Identity Registration')}
            {step === 'mode' && 'Choose your mode'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          {step === 'gate' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                <ShieldCheck className="absolute top-0 right-0 w-32 h-32 text-white/5 -mr-8 -mt-8" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Entry Required</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">This intelligence module is protected by a daily access key. Please provide the key shared by your supervisor.</p>
                  
                  <div className="pt-4">
                    <Input 
                      type="text"
                      placeholder="ENTER DAILY ACCESS KEY"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-16 text-center text-2xl font-black tracking-[0.2em] bg-white/5 border-white/10 rounded-2xl focus:ring-primary/40 uppercase placeholder:text-slate-700 text-primary"
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleVerifyPassword}
                disabled={!password.trim()}
                className="w-full h-20 rounded-full text-xl font-black shadow-2xl transition-all hover:scale-[1.02] bg-primary uppercase tracking-tighter"
              >
                Authenticate Node
                <ShieldCheck className="w-6 h-6 ml-2" />
              </Button>
            </div>
          )}

          {step === 'identity' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
          )}

          {step === 'mode' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">How do you want to take this test?</p>
              </div>

              <div className="bg-slate-100/50 p-2 rounded-full flex items-center justify-between border border-slate-100 shadow-inner">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-3 py-4 px-2 rounded-full transition-all duration-300",
                      selectedMode === mode.id 
                        ? cn(mode.colorClass, "text-white shadow-xl scale-100") 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                    )}
                  >
                    <mode.icon className={cn("w-5 h-5", selectedMode === mode.id ? "text-white" : "text-slate-400")} />
                    <span className="text-sm font-black uppercase tracking-tight">{mode.title}</span>
                  </button>
                ))}
              </div>

              <div className="text-center min-h-[20px] animate-in fade-in duration-500">
                <p className={cn("text-lg font-bold italic transition-colors duration-300", currentModeInfo?.textClass)}>
                  {currentModeInfo?.desc}
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => onStart(selectedMode)}
                  className={cn(
                    "w-full h-20 rounded-full font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-tighter border-none",
                    currentModeInfo?.btnClass
                  )}
                >
                  Start Assessment
                  <Play className="w-6 h-6 ml-3 fill-current" />
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setStep('identity')}
                  className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors"
                >
                  Change Identity Registry
                </button>
                {isProtectionEnabled && (
                  <button 
                    onClick={() => { setStep('gate'); setPassword(''); }}
                    className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    Lock Assessment Session
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
