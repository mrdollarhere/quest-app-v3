"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
  ShieldCheck,
  Clock,
  ListChecks,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  LogIn
} from "lucide-react";
import { QuizMode } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { generateDailyPassword } from '@/lib/security-utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';

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
  guestAccessAllowed?: boolean;
  onStart: (mode: QuizMode) => void;
}

type Step = 'gate' | 'identity' | 'mode' | 'login_required';

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
  guestAccessAllowed = true,
  onStart
}: QuizStartProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>(() => {
    if (isProtectionEnabled) return 'gate';
    if (!user && !guestAccessAllowed) return 'login_required';
    return user ? 'mode' : 'identity';
  });
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<QuizMode>('test');
  const { toast } = useToast();

  const handleVerifyPassword = () => {
    const dailyKey = generateDailyPassword(undefined, protocolSalt);
    if (password.trim().toUpperCase() === dailyKey.toUpperCase()) {
      toast({
        title: "Access Granted",
        description: "Security Protocol Cleared.",
      });
      
      if (!user && !guestAccessAllowed) {
        setStep('login_required');
      } else {
        setStep(user ? 'mode' : 'identity');
      }
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The daily security key provided is invalid.",
      });
    }
  };

  const modes = [
    {
      id: 'training' as QuizMode,
      title: 'Practice',
      icon: Gamepad2,
      desc: 'Fixed sequence, take your time',
      colorClass: 'bg-green-500 shadow-green-500/20',
      textClass: 'text-green-600',
      btnClass: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'test' as QuizMode,
      title: 'Test',
      icon: Target,
      desc: 'Timed, shuffled, results at the end',
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-white">
      <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 bg-gradient-to-r from-primary to-indigo-600 p-10 md:p-14 text-center">
          <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-2xl ring-1 ring-white/20">
            <Zap className="w-10 h-10 text-white fill-white/20" />
          </div>
          <CardTitle className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none mb-4">
            {title}
          </CardTitle>
          <p className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px]">
            {step === 'gate' ? 'Security Protocol Required' : 
             step === 'login_required' ? 'Authentication Required' :
             step === 'identity' ? 'Mission Registration' : 
             'Mode Selection'}
          </p>
        </div>

        <CardContent className="px-10 md:px-16 pt-12 pb-16 relative z-10">
          {step === 'gate' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <ShieldCheck className="absolute top-0 right-0 w-32 h-32 text-white/5 -mr-8 -mt-8" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Entry Required</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">This module is protected by a daily access key. Provide the key from your supervisor to initialize.</p>
                  
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

          {step === 'login_required' && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="p-10 bg-red-50 dark:bg-red-900/10 rounded-[3rem] border-2 border-red-100 dark:border-red-900/20">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  {t('loginRequiredTitle')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('loginRequiredDesc')}
                </p>
              </div>
              
              <Link href="/login" className="block w-full">
                <Button className="w-full h-20 rounded-full text-xl font-black shadow-2xl transition-all hover:scale-[1.02] bg-slate-900 text-white uppercase tracking-tighter">
                  {t('goToLogin')}
                  <LogIn className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              
              <button onClick={() => setStep('gate')} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors">
                Return to Security Gate
              </button>
            </div>
          )}

          {step === 'identity' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-blue-100/50 shadow-sm">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <p className="text-xl font-black text-slate-900">{questionsCount}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Steps</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-indigo-100/50 shadow-sm">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <p className="text-xl font-black text-slate-900">{duration || '15m'}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-slate-200/50 shadow-sm">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                  <p className="text-xl font-black text-slate-900">Standard</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Difficulty</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="guestName" className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 ml-1">Operator Callsign</Label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="guestName"
                    placeholder="Enter full name for registry..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-18 pl-14 rounded-2xl bg-white border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xl font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => guestName.trim() ? setStep('mode') : null}
                  disabled={!guestName.trim()}
                  className="w-full h-20 rounded-full text-2xl font-black shadow-2xl transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-indigo-600 text-white uppercase tracking-tighter group hover:shadow-primary/20"
                >
                  Begin Mission
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Your session is private. Results tracked in real-time.
                </p>
              </div>
            </div>
          )}

          {step === 'mode' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">"How do you want to take this test?"</p>
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

              <div className="pt-4 space-y-6">
                <Button 
                  onClick={() => onStart(selectedMode)}
                  className={cn(
                    "w-full h-20 rounded-full font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-tighter border-none text-white",
                    currentModeInfo?.btnClass
                  )}
                >
                  Initialize Protocol
                  <Play className="w-6 h-6 ml-3 fill-current" />
                </Button>
                
                <div className="flex flex-col gap-4">
                  {!user && guestAccessAllowed && (
                    <button 
                      onClick={() => setStep('identity')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      Modify Callsign Registry
                    </button>
                  )}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}