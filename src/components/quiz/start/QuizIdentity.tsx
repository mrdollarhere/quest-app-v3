/**
 * src/components/quiz/start/QuizIdentity.tsx
 * 
 * Purpose: Registration step for student nodes with advanced identity validation.
 * Features: Extreme Lockdown Protocol, progressive lockout, and bot honeypot.
 */

"use client";

import React, { useState, useEffect } from 'react';
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
  Zap,
  ShieldCheck
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { validateStudentName } from '@/lib/name-validator';
import { useNameLockout } from '@/hooks/use-name-lockout';
import { ExtremeLockdown } from '../ExtremeLockdown';

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
  const [honeypot, setHoneypot] = useState(''); 
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // Grace Period Protocol after unlocking
  useEffect(() => {
    if (!isLocked && lockoutTime === 0) {
      setIsGracePeriod(true);
      const timer = setTimeout(() => setIsGracePeriod(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, lockoutTime]);

  const handleBegin = () => {
    if (isLocked || isGracePeriod) return;

    // BOT DETECTION: Honeypot triggers immediate max quarantine
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

  const lockReason = "Your student node has been quarantined due to repeated identity validation failures. Entry into the assessment registry is strictly prohibited.";

  return (
    <>
      <ExtremeLockdown 
        isLocked={isLocked} 
        lockoutTime={lockoutTime} 
        reason={lockReason}
        onUnlock={() => {}} 
      />

      <div className={cn(
        "space-y-10 animate-in fade-in slide-in-from-right-4 duration-500",
        isLocked && "opacity-0 pointer-events-none"
      )}>
        <div className="grid grid-cols-3 gap-4">
          <StatNode icon={ListChecks} value={questionsCount} label={language === 'vi' ? 'Câu hỏi' : 'Nodes'} color="blue" />
          <StatNode icon={Clock} value={duration || '15m'} label={language === 'vi' ? 'Thời gian' : 'Limit'} color="indigo" />
          <StatNode icon={BarChart3} value="v4.0" label="Logic" color="slate" />
        </div>

        <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-start gap-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck className="w-20 h-20 text-white" /></div>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <Zap className="w-6 h-6 text-white fill-white/20" />
          </div>
          <div className="space-y-1.5 relative z-10">
            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Registry Protocol</h4>
            <p className="text-sm font-bold text-white leading-relaxed">
              {language === 'vi' 
                ? 'Nhập đầy đủ Họ và Tên thật để bắt đầu. Hệ thống sẽ từ chối các định danh không hợp lệ.'
                : 'Input your Full Legal Name to initialize. The registry will reject random mashing or low-fidelity nodes.'
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
              disabled={isGracePeriod}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (error) setError(null);
              }}
              className={cn(
                "h-20 pl-14 rounded-2xl border-2 text-xl font-black transition-all",
                error ? "border-rose-200 bg-rose-50/30 focus:ring-rose-500/20" : "border-slate-100 focus:ring-primary/20",
                isGracePeriod && "opacity-50"
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
            />
          </div>
        </div>

        <div className="space-y-5">
          <Button 
            onClick={handleBegin}
            disabled={!guestName.trim() || isLocked || isGracePeriod}
            className="w-full h-20 rounded-full text-2xl font-black uppercase tracking-tighter shadow-2xl transition-all border-none bg-primary text-white hover:scale-[1.02]"
          >
            {isGracePeriod ? 'INITIALIZING...' : (language === 'vi' ? 'Bắt Đầu Mission' : 'Initialize Mission')} <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Authorized Access</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <Button 
            variant="outline"
            disabled={isGracePeriod}
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
