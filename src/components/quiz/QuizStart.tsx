/**
 * src/components/quiz/QuizStart.tsx
 * 
 * Purpose: Entry terminal for all assessment modules, handling security, identity, and mode configuration.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, ShieldAlert, LogIn } from "lucide-react";
import { QuizMode } from '@/types/quiz';
import { generateDailyPassword } from '@/lib/security-utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

// Sub-components per Protocol v18.9
import { QuizGate } from './start/QuizGate';
import { QuizIdentity } from './start/QuizIdentity';
import { QuizModes } from './start/QuizModes';

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
  testId?: string;
}

type Step = 'gate' | 'identity' | 'mode' | 'login_required';

export function QuizStart({ title, questionsCount, duration, user, guestName, setGuestName, protocolSalt, isProtectionEnabled = true, guestAccessAllowed = true, onStart, testId }: QuizStartProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<Step>(() => {
    if (isProtectionEnabled) return 'gate';
    if (!user && !guestAccessAllowed) return 'login_required';
    
    // Logic: Skip identity step if a callsign already exists in the persistent registry
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('dntrng_guest_name') : null;
    if (user || (savedName && savedName.trim().length > 0)) return 'mode';
    
    return 'identity';
  });
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<QuizMode | 'live'>('test');

  // REGISTRY SYNC PROTOCOL: Ensure props match localStorage during state transitions
  useEffect(() => {
    if (!user && !guestName) {
      const savedName = localStorage.getItem('dntrng_guest_name');
      if (savedName && savedName.trim() !== "") {
        setGuestName(savedName);
      }
    }
  }, [user, guestName, setGuestName]);

  const handleVerify = () => {
    if (password.trim().toUpperCase() === generateDailyPassword(undefined, protocolSalt).toUpperCase()) {
      toast({ title: "Access Granted", description: "Security Protocol Cleared." });
      
      const savedName = localStorage.getItem('dntrng_guest_name');
      if (!user && !guestAccessAllowed) {
        setStep('login_required');
      } else if (user || (savedName && savedName.trim().length > 0)) {
        if (savedName && !user) setGuestName(savedName);
        setStep('mode');
      } else {
        setStep('identity');
      }
    } else {
      toast({ variant: "destructive", title: "Access Denied" });
    }
  };

  const handleIdentityContinue = () => {
    if (guestName) {
      localStorage.setItem('dntrng_guest_name', guestName);
    }
    setStep('mode');
  };

  const handleSwitchIdentity = () => {
    localStorage.removeItem('dntrng_guest_name');
    setGuestName('');
    setStep('identity');
  };

  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-10 md:p-14 text-center">
          <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-2xl ring-1 ring-white/20">
            <Zap className="w-10 h-10 text-white fill-white/20" />
          </div>
          <CardTitle className="text-4xl md:text-5xl font-black uppercase text-white leading-none mb-4">{title}</CardTitle>
          <p className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px]">
            {step === 'gate' ? 'Security Gate' : step === 'identity' ? 'Registration' : 'Configuration'}
          </p>
        </div>

        <CardContent className="px-10 md:px-16 pt-12 pb-16">
          {step === 'gate' && <QuizGate password={password} setPassword={setPassword} onVerify={handleVerify} />}
          
          {step === 'login_required' && (
            <div className="space-y-8 text-center animate-in fade-in duration-500">
              <div className="p-10 bg-red-50 rounded-[3rem] border-2 border-red-100">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase mb-4">{t('loginRequiredTitle')}</h3>
                <p className="text-slate-500 font-medium">{t('loginRequiredDesc')}</p>
              </div>
              <Link href={`/login?returnTo=${encodeURIComponent(returnToUrl)}`}>
                <Button className="w-full h-20 rounded-full text-xl font-black bg-slate-900 text-white uppercase"><LogIn className="mr-3" /> {t('goToLogin')}</Button>
              </Link>
            </div>
          )}

          {step === 'identity' && (
            <QuizIdentity 
              guestName={guestName} 
              setGuestName={setGuestName} 
              onContinue={handleIdentityContinue} 
              questionsCount={questionsCount} 
              duration={duration} 
            />
          )}
          
          {step === 'mode' && (
            <QuizModes 
              selectedMode={selectedMode} 
              setSelectedMode={setSelectedMode} 
              onStart={onStart} 
              testId={testId} 
              testName={title} 
              guestName={user?.displayName || guestName}
              onSwitchIdentity={!user ? handleSwitchIdentity : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
