/**
 * QuickSignIn.tsx
 * 
 * Purpose: Embedded identity handshake node for the landing gateway.
 * Refactored: v19.2.0 - Optimized as a modular card for horizontal hero integration.
 * Compliance: Protocol v18.9.7 - Rectangular Geometry Enforced.
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
    <div className={cn(
      "w-full overflow-hidden shadow-2xl transition-all duration-700 rounded-none border animate-in fade-in slide-in-from-right-8",
      user ? "bg-slate-900 text-white p-10" : "bg-white border-slate-100 p-10"
    )}>
      {user ? (
        <div className="flex flex-col gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
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
            <Button className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-xl transition-all hover:scale-[1.02]">
              Access Profile <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-none"><LogIn className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Quick Access</h3>
            </div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Verify your identity node to access historical mission logs and diagnostics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Node</Label>
                <Input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-none bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Secret Key</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-none bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-sm"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !email || !password}
              className="w-full h-14 rounded-full bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10 border-none hover:scale-[1.01] transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
              Verify Identity
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
