/**
 * src/components/quiz/start/QuizIdentity.tsx
 * 
 * Purpose: Registration step for student nodes with advanced identity validation.
 * Features: Progressive lockout, bilingual error feedback, and bot honeypot.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Timer,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';
import { useLanguage } from '@/context/language-context';
import { validateStudentName } from '@/lib/name-validator';
import { useNameLockout } from '@/hooks/use-name-lockout';

interface QuizIdentityProps {
  guestName: string;
  setGuestName: (val: string) => void;
  onContinue: () => void;
  questionsCount: number;
  duration?: string;
}

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const { language } = useLanguage();
  const { isLocked, lockoutTime, triggerViolation } = useNameLockout();
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState(''); // Bot Trap
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // Interaction Suppression Protocol
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
  }, [isLocked]);

  const handleBegin = () => {
    if (isLocked) return;

    // BOT DETECTION: If honeypot is filled, trigger maximum quarantine
    if (honeypot.length > 0) {
      triggerViolation(true);
      return;
    }

    const result = validateStudentName(guestName);
    
    if (!result.valid) {
      const msg = language === 'vi' ? result.reason?.vi : result.reason?.en;
      setError(msg || 'Invalid Identity');
      triggerViolation();
      return;
    }

    setError(null);
    onContinue();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* FULL-SCREEN QUARANTINE OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="max-w-md w-full space-y-12">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-24 h-24 bg-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                <ShieldAlert className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                {language === 'vi' ? 'Terminal Bị Khóa' : 'Terminal Locked'}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest">
                Registry Integrity Violation
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                {language === 'vi' 
                  ? 'Nút sinh viên của bạn đã bị cách ly do vi phạm quy trình xác thực định danh. Vui lòng chờ cho đến khi thời gian khóa kết thúc.'
                  : 'Your student node has been quarantined due to identity validation failures. Access to the intelligence registry is strictly prohibited until reset.'
                }
              </p>
            </div>

            <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Reset Pulse In</p>
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
              Security Protocol v4.0 — DNTRNG™
            </p>
          </div>
        </div>
      )}

      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="grid grid-cols-3 gap-4">
          <StatNode icon={ListChecks} value={questionsCount} label={language === 'vi' ? 'Câu hỏi' : 'Nodes'} color="blue" />
          <StatNode icon={Clock} value={duration || '15m'} label={language === 'vi' ? 'Thời gian' : 'Limit'} color="indigo" />
          <StatNode icon={BarChart3} value="v4.0" label="Logic" color="slate" />
        </div>

        {/* INSTRUCTIONAL NODE */}
        <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-start gap-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck className="w-20 h-20 text-white" /></div>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <Zap className="w-6 h-6 text-white fill-white/20" />
          </div>
          <div className="space-y-1.5 relative z-10">
            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Registry Protocol</h4>
            <p className="text-sm font-bold text-white leading-relaxed">
              {language === 'vi' 
                ? 'Nhập đầy đủ Họ và Tên thật để bắt đầu. Hệ thống sẽ từ chối các định danh không hợp lệ hoặc ngẫu nhiên.'
                : 'Input your Full Legal Name to initialize. The registry will reject random mashing or low-fidelity identity nodes.'
              }
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Callsign Registry</Label>
            {error && (
              <span className="text-[10px] font-bold uppercase flex items-center gap-1.5 animate-in slide-in-from-right-2 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}
          </div>
          
          <div className="relative">
            <User className={cn("absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", error ? "text-rose-400" : "text-slate-300")} />
            
            {/* HONEYPOT BOT TRAP (sr-only) */}
            <input 
              type="text" 
              className="sr-only" 
              tabIndex={-1} 
              aria-hidden="true" 
              value={honeypot} 
              onChange={(e) => setHoneypot(e.target.value)} 
            />

            <Input 
              placeholder={language === 'vi' ? "Ví dụ: Nguyễn Văn A" : "E.G. John Doe"}
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
            disabled={!guestName.trim() || isLocked}
            className="w-full h-20 rounded-full text-2xl font-black uppercase tracking-tighter shadow-2xl transition-all border-none bg-primary text-white hover:scale-[1.02]"
          >
            {language === 'vi' ? 'Bắt Đầu Mission' : 'Initialize Mission'} <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Authorized Access</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <Button 
            variant="outline"
            onClick={() => router.push(`/login?returnTo=${encodeURIComponent(returnToUrl)}`)}
            className="w-full h-16 rounded-full border-2 border-slate-200 font-black text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            <LogIn className="w-4 h-4 mr-3" /> {language === 'vi' ? 'Xác thực định danh học sinh' : 'Verify via Identity Registry'}
          </Button>
        </div>
      </div>
    </>
  );
}

function StatNode({ icon: Icon, value, label, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    slate: "bg-slate-50 border-slate-100 text-slate-600"
  };
  return (
    <div className={cn("rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border shadow-sm", colors[color])}>
      <Icon className="w-4 h-4 opacity-70" />
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
    </div>
  );
}
