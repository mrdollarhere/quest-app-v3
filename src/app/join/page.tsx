/**
 * join/page.tsx
 * 
 * Route: /join
 * Purpose: Student entry gateway for live classroom sessions.
 * Updated: v19.1.0 - Added Bilingual (EN/VI) hints and real-time feedback.
 */

"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ArrowRight, Loader2, User, Key, AlertCircle, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { SiteFooter } from '@/components/SiteFooter';
import { validateStudentName } from '@/lib/name-validator';
import { cn } from '@/lib/utils';

const LABELS = {
  en: {
    restrictedTitle: "Restricted Session",
    restrictedBody: "This session requires an approved name. Enter your name exactly as your teacher registered it.",
    restrictedHint: "Name must match your teacher's roster exactly. Contact your teacher if you have trouble joining.",
    openHint: "Enter your real full name",
    openExample: "e.g. Nguyen Van An",
    placeholder_whitelist: "Enter your registered name... / Nhập tên đã đăng ký...",
    placeholder_open: "Your full name... / Họ và tên...",
    incomplete: "Please enter your full name",
    valid: "Looks good",
    invalid: "Please enter a real name",
    joinError_unauthorized: "Your name is not on the approved list for this session. Please contact your teacher.",
    joinError_vi: "Tên của bạn không có trong danh sách được phê duyệt. Vui lòng liên hệ giáo viên."
  },
  vi: {
    restrictedTitle: "Phiên Học Giới Hạn",
    restrictedBody: "Phiên học này yêu cầu tên đã được phê duyệt. Nhập tên của bạn đúng như giáo viên đã đăng ký.",
    restrictedHint: "Tên phải khớp chính xác với danh sách của giáo viên. Liên hệ giáo viên nếu bạn gặp khó khăn khi tham gia.",
    openHint: "Nhập họ và tên thật của bạn",
    openExample: "vd. Nguyễn Văn An",
    placeholder_whitelist: "Nhập tên đã đăng ký...",
    placeholder_open: "Họ và tên đầy đủ...",
    incomplete: "Vui lòng nhập họ và tên đầy đủ",
    valid: "Tên hợp lệ",
    invalid: "Vui lòng nhập tên thật"
  }
};

function JoinContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [roomMode, setRoomMode] = useState<'open' | 'whitelist' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const errorParam = searchParams.get('error');

  // SESSION AUDIT PROTOCOL
  useEffect(() => {
    if (errorParam === 'session-ended') {
      toast({ 
        variant: "destructive", 
        title: "Session Closed", 
        description: "THIS SESSION HAS ENDED / PHIÊN HỌC ĐÃ KẾT THÚC" 
      });
    }
  }, [errorParam, toast]);

  // Identity Auto-fill Protocol
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    } else if (!name) {
      const savedName = localStorage.getItem('dntrng_guest_name');
      if (savedName) setName(savedName);
    }
  }, [user, name]);

  // Mode detection protocol
  useEffect(() => {
    if (roomCode.length === 6) {
      const fetchRoomDetails = async () => {
        try {
          const res = await fetch(`/api/live/room-details?code=${roomCode}`);
          if (res.ok) {
            const data = await res.json();
            // Note: room-details doesn't return join_mode yet in v18.9, 
            // but we can infer or handle it during join attempt.
            // For now, we'll rely on server-side errors to show the correct bilingual message.
          }
        } catch (e) {}
      };
      fetchRoomDetails();
    }
  }, [roomCode]);

  const validationStatus = useMemo(() => {
    if (name.length < 4) return null;
    const words = name.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return 'incomplete';
    const result = validateStudentName(name);
    return result.valid ? 'valid' : 'invalid';
  }, [name]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !name) return;

    setLoading(true);
    try {
      const res = await fetch('/api/live/join-room', {
        method: 'POST',
        body: JSON.stringify({ roomCode, studentName: name })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('dntrng_guest_name', name);
        toast({ title: "Connected", description: `Joined ${data.hostName}'s session.` });
        router.push(`/live/${roomCode}?studentId=${data.studentId}`);
      } else {
        // EN + VI Error formatting for toasts
        let errorMsg = data.error;
        if (data.error.includes("not on the approved list")) {
          errorMsg = `${LABELS.en.joinError_unauthorized}\n${LABELS.en.joinError_vi}`;
        }
        
        toast({ 
          variant: "destructive", 
          title: "Join Error / Lỗi Tham Gia", 
          description: errorMsg 
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failure" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 transition-all duration-300">
      <div className="flex-1 flex flex-col items-center w-full max-w-md pb-24 px-6">
        <Link href="/" className="mb-12">
          <img src="/brand/logo-horizontal.png" alt="DNTRNG" className="h-10" />
        </Link>

        <Card className="w-full border-none shadow-2xl rounded-none overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="w-20 h-20 text-white" /></div>
            <div className="mx-auto w-16 h-16 bg-primary rounded-none flex items-center justify-center mb-6 shadow-xl">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">Live Entry</CardTitle>
            <CardDescription className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Classroom Session Protocol</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-12 space-y-8">
            {errorParam === 'session-ended' && (
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Session Ended</p>
                  <p className="text-[10px] font-bold uppercase opacity-80">Phiên học đã kết thúc</p>
                </div>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Room Access Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="E.G. K4X9M2"
                    maxLength={6}
                    className="h-14 pl-11 text-xl font-black tracking-[0.2em] rounded-none bg-slate-50 border-none ring-1 ring-slate-100 uppercase focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={`${LABELS.en.placeholder_open} / ${LABELS.vi.placeholder_open}`}
                      className="h-14 pl-11 font-bold rounded-none bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Feedback nodes */}
                {validationStatus && (
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

                <div className="space-y-1 px-1">
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">
                    {LABELS.en.openHint} / {LABELS.vi.openHint}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400">
                    ({LABELS.en.openExample} / {LABELS.vi.openExample})
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !roomCode || !name}
                className="w-full h-16 rounded-none bg-primary font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all border-none"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <ArrowRight className="w-6 h-6 mr-2" />}
                Initialize Session
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <SiteFooter className="w-full" />
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinContent />
    </Suspense>
  );
}
