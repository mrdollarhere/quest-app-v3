"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { validateStudentName } from '@/lib/name-validator';
import { useNameLockout } from '@/hooks/use-name-lockout';
import { ExtremeLockdown } from '../ExtremeLockdown';
import { useNameAutocomplete } from '@/hooks/use-name-autocomplete';
import { NameAutocomplete } from '@/components/shared/NameAutocomplete';

interface QuizIdentityProps {
  guestName: string;
  setGuestName: (val: string) => void;
  onContinue: () => void;
  questionsCount: number;
  duration?: string;
}

const LABELS = {
  en: {
    restrictedTitle: "Restricted Session",
    restrictedBody: "This session requires an approved name. Enter your name exactly as your teacher registered it.",
    restrictedHint: "Name must match your teacher's roster exactly. Contact your teacher if you have trouble.",
    openHint: "Enter your real full name",
    openExample: "e.g. Nguyen Van An",
    placeholder_whitelist: "Enter your registered name... / Nhập tên đã đăng ký...",
    placeholder_open: "Your full name... / Họ và tên...",
    incomplete: "Please enter your full name",
    valid: "Looks good",
    invalid: "Please enter a real name",
    unauthorized: "Your name is not on the approved list. Please contact your teacher.",
    spam: "Please enter a real full name."
  },
  vi: {
    restrictedTitle: "Phiên Học Giới Hạn",
    restrictedBody: "Phiên học này yêu cầu tên đã được phê duyệt. Nhập tên của bạn đúng như giáo viên đã đăng ký.",
    restrictedHint: "Tên phải khớp chính xác với danh sách của giáo viên. Liên hệ giáo viên nếu bạn gặp khó khăn.",
    openHint: "Nhập họ và tên thật của bạn",
    openExample: "vd. Nguyễn Văn An",
    placeholder_whitelist: "Nhập tên đã đăng ký...",
    placeholder_open: "Họ và tên đầy đủ...",
    incomplete: "Vui lòng nhập họ và tên đầy đủ",
    valid: "Tên hợp lệ",
    invalid: "Vui lòng nhập tên thật",
    unauthorized: "Tên của bạn không có trong danh sách được phê duyệt. Vui lòng liên hệ giáo viên.",
    spam: "Vui lòng nhập họ và tên thật."
  }
};

export function QuizIdentity({ guestName, setGuestName, onContinue, questionsCount, duration }: QuizIdentityProps) {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { isLocked, lockoutTime, triggerViolation } = useNameLockout();
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState(''); 
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  const joinMode = settings.join_mode || 'open';
  const whitelist: string[] = useMemo(() => {
    try { return JSON.parse(settings.name_whitelist || '[]'); }
    catch { return []; }
  }, [settings.name_whitelist]);

  const customBlacklist: string[] = useMemo(() => {
    try { return JSON.parse(settings.custom_blacklist || '[]'); }
    catch { return []; }
  }, [settings.custom_blacklist]);

  const isWhitelistActive = joinMode === 'whitelist' && whitelist.length > 0;

  // Real-time validation for Open Mode
  const validationStatus = useMemo(() => {
    if (isWhitelistActive || guestName.length < 4) return null;
    
    const words = guestName.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return 'incomplete';
    
    const result = validateStudentName(guestName, customBlacklist);
    return result.valid ? 'valid' : 'invalid';
  }, [guestName, isWhitelistActive, customBlacklist]);

  // AUTOCOMPLETE HANDSHAKE
  const { 
    suggestions, 
    isOpen, 
    setIsOpen, 
    highlightedIndex, 
    setHighlightedIndex, 
    handleKeyDown 
  } = useNameAutocomplete({
    value: guestName,
    joinMode: (joinMode as any) || 'open',
    whitelist,
    customBlacklist,
    onSelect: (name) => {
      setGuestName(name);
      if (error) setError(null);
    }
  });

  // Grace Period Protocol after unlocking
  useEffect(() => {
    if (!isLocked && lockoutTime === 0) {
      setIsGracePeriod(true);
      const timer = setTimeout(() => setIsGracePeriod(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, lockoutTime]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleBegin = () => {
    if (isLocked || isGracePeriod || isOpen) return;

    if (honeypot.length > 0) {
      triggerViolation(true);
      return;
    }

    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const inputTarget = normalize(guestName);

    if (isWhitelistActive) {
      const isApproved = whitelist.some((name: string) => normalize(name) === inputTarget);
      
      if (!isApproved) {
        setError(`${LABELS.en.unauthorized}\n${LABELS.vi.unauthorized}`);
        return;
      }
      setError(null);
      onContinue();
    } else {
      const result = validateStudentName(guestName, customBlacklist);
      if (!result.valid) {
        setError(`${LABELS.en.spam}\n${LABELS.vi.spam}`);
        triggerViolation();
        return;
      }
      setError(null);
      onContinue();
    }
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
          <StatNode icon={BarChart3} value="v4.2" label="Logic" color="slate" />
        </div>

        {isWhitelistActive ? (
          <div className="p-8 bg-slate-900 text-white rounded-none border-l-4 border-primary shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Lock className="w-20 h-20 text-white" /></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">
                  {LABELS.en.restrictedTitle} / {LABELS.vi.restrictedTitle}
                </h4>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold leading-relaxed text-slate-300">
                  {LABELS.en.restrictedBody}
                </p>
                <p className="text-xs font-bold leading-relaxed text-slate-400">
                  {LABELS.vi.restrictedBody}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-none flex items-start gap-5 border border-slate-100 group">
            <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shrink-0 shadow-lg">
              <Zap className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div className="space-y-2 relative z-10">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Registry Protocol</h4>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {LABELS.en.openHint} / {LABELS.vi.openHint}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  ({LABELS.en.openExample} / {LABELS.vi.openExample})
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 relative" ref={containerRef}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5 ml-1">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Your full name</span>
              <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-70">Họ và tên của bạn</span>
            </div>
            {error && (
              <span className="text-[9px] font-bold uppercase flex items-center gap-1.5 animate-in slide-in-from-right-2 text-rose-500 text-right leading-tight">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-pre-line">{error}</span>
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
              placeholder={isWhitelistActive ? "Enter your registered name... / Nhập tên đã đăng ký..." : "Your full name... / Họ và tên..."}
              value={guestName}
              disabled={isGracePeriod}
              autoComplete="off"
              onFocus={() => guestName.length >= 2 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (error) setError(null);
                setIsOpen(e.target.value.length >= 2);
              }}
              className={cn(
                "h-20 pl-14 rounded-none border-2 text-xl font-black transition-all",
                error ? "border-rose-200 bg-rose-50/30 focus:ring-rose-500/20" : "border-slate-100 focus:ring-primary/20",
                isGracePeriod && "opacity-50"
              )}
            />

            <NameAutocomplete 
              suggestions={suggestions}
              isOpen={isOpen}
              highlightedIndex={highlightedIndex}
              onHover={setHighlightedIndex}
              onSelect={(name) => {
                setGuestName(name);
                setIsOpen(false);
                if (error) setError(null);
              }}
            />
          </div>

          {/* Real-time Feedback nodes */}
          {!isWhitelistActive && validationStatus && guestName.length >= 4 && (
            <div className="px-1 animate-in fade-in slide-in-from-top-1 duration-300">
              {validationStatus === 'incomplete' && (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-bold uppercase tracking-tight">
                    {LABELS.en.incomplete} / {LABELS.vi.incomplete}
                  </p>
                </div>
              )}
              {validationStatus === 'valid' && (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-black uppercase tracking-tight">
                    {LABELS.en.valid} / {LABELS.vi.valid}
                  </p>
                </div>
              )}
              {validationStatus === 'invalid' && (
                <div className="flex items-center gap-2 text-rose-500">
                  <XCircle className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-black uppercase tracking-tight">
                    {LABELS.en.invalid} / {LABELS.vi.invalid}
                  </p>
                </div>
              )}
            </div>
          )}

          {isWhitelistActive && (
            <div className="px-1 space-y-1">
              <p className="text-[9px] font-bold text-slate-400 leading-tight">
                {LABELS.en.restrictedHint}
              </p>
              <p className="text-[9px] font-bold text-slate-400 leading-tight">
                {LABELS.vi.restrictedHint}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Button 
            onClick={handleBegin}
            disabled={!guestName.trim() || isLocked || isGracePeriod}
            className="w-full h-20 rounded-none text-2xl font-black uppercase tracking-tighter shadow-2xl transition-all border-none bg-primary text-white hover:scale-[1.01]"
          >
            <div className="flex flex-col items-center">
              <span className="block font-bold">Begin Test</span>
              <span className="block text-sm opacity-80 font-normal">Bắt đầu bài thi</span>
            </div>
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-100" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Already registered?</span>
              <span className="text-[8px] font-bold uppercase text-slate-300 tracking-widest leading-none mt-1">Đã có tài khoản?</span>
            </div>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <Button 
            variant="outline"
            disabled={isGracePeriod}
            onClick={() => router.push(`/login?returnTo=${encodeURIComponent(returnToUrl)}`)}
            className="w-full h-20 rounded-none border-2 border-slate-200 font-black text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            <LogIn className="w-4 h-4 mr-3" />
            <div className="flex flex-col items-start text-left">
              <span className="block font-bold">Log in to your account</span>
              <span className="block text-xs opacity-80 font-normal">Đăng nhập tài khoản</span>
            </div>
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
    <div className={cn("rounded-none p-5 flex flex-col items-center justify-center gap-2 border shadow-sm", colors[color])}>
      <Icon className="w-4 h-4 opacity-70" />
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
    </div>
  );
}
