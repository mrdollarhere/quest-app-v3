/**
 * QuickSignIn.tsx
 * 
 * Purpose: Embedded identity handshake node for the landing page.
 * Logic: Detects auth state and provides a streamlined entry point or welcome back signature.
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
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700",
          user ? "bg-slate-900 text-white p-12" : "bg-white border border-slate-100 p-12"
        )}>
          {user ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/20">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-1">Active Operator</p>
                  <h3 className="text-3xl font-black uppercase tracking-tight">Welcome back, {user.displayName || 'Operator'}.</h3>
                  <p className="text-slate-400 font-medium mt-1">Your identity node is active and synchronized.</p>
                </div>
              </div>
              <Link href="/profile">
                <Button className="h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest border-none shadow-xl transition-all hover:scale-105">
                  Access Profile <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><LogIn className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Quick Access</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Initialize an identity handshake directly from the gateway to access your historical mission logs and analytics.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Node</Label>
                    <Input 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Secret Key</Label>
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
                  className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10 border-none hover:scale-[1.01] transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  Verify Identity
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
