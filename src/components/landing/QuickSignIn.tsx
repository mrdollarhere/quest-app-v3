/**
 * QuickSignIn.tsx
 * 
 * Purpose: Embedded identity handshake node for the landing gateway.
 * Refactored: v19.2.0 - Optimized as a modular card for horizontal hero integration.
 * Updated: v19.8.0 - Stacked Bilingual Presentation (EN/VI).
 */

"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { en } from '@/locales/en';
import { vi } from '@/locales/vi';

export function QuickSignIn() {
  const { user, login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      toast({ title: "Authorized", description: "Identity registry synchronized." });
    } else {
      toast({ variant: "destructive", title: "Auth Failure", description: result.message });
    }
    setLoading(false);
  };

  if (authLoading) return null;

  return (
    <div className={cn(
      "w-full overflow-hidden shadow-2xl transition-all duration-700 rounded-[2.5rem] border animate-in fade-in slide-in-from-right-8",
      user ? "bg-slate-900 text-white p-10" : "bg-white border-slate-100 p-10"
    )}>
      {user ? (
        <div className="flex flex-col gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-1">Active Operator</p>
              <h3 className="text-2xl font-black uppercase tracking-tight truncate">
                {user.displayName?.split(' ')[0] || 'Authenticated'}
              </h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Identity node synced</p>
            </div>
          </div>
          <Link href="/profile" className="w-full">
            <Button className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest border-none shadow-xl transition-all hover:scale-[1.02]">
              <div className="flex flex-col items-center">
                <span className="text-xs">Access Profile</span>
                <span className="text-[10px] font-normal opacity-80 normal-case">Hồ sơ cá nhân</span>
              </div>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl"><LogIn className="w-5 h-5 text-primary" /></div>
              <div className="leading-tight">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Quick Access</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Truy cập nhanh</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Verify your identity node to access historical mission logs and diagnostics.
              </p>
              <p className="text-slate-400 text-[10px] font-medium leading-relaxed italic">
                Xác minh danh tính để xem lịch sử nhiệm vụ và chẩn đoán.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex justify-between items-end px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Node</span>
                  <span className="text-[8px] font-bold uppercase text-slate-300">Tài khoản</span>
                </Label>
                <Input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex justify-between items-end px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secret Key</span>
                  <span className="text-[8px] font-bold uppercase text-slate-300">Mật khẩu</span>
                </Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-sm"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !email || !password}
              className="w-full h-20 rounded-full bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/10 border-none hover:scale-[1.01] transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-sm">Verify Identity</span>
                  <span className="text-[10px] font-normal opacity-80 normal-case">Xác minh danh tính</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
