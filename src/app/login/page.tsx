"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, LogIn, Loader2, ArrowLeft, Mail, Lock, UserPlus, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useSettings } from '@/context/settings-context';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function LoginContent() {
  const { login, user } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  // Protocol: Explicit string casting to prevent type errors from numeric sheet entries
  const brandName = String(settings.platform_name || "DNTRNG");

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        const returnTo = searchParams.get('returnTo');
        if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
          router.push(returnTo);
        } else {
          router.push('/profile');
        }
      }, 2200); // Calibration delay for UX immersion
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      setLoginSuccess(true);
    } else {
      let errorDesc = "Invalid credentials. Access denied.";
      if (result.message === "domain_restricted") {
        errorDesc = t('domainRestricted');
      }
      
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorDesc,
      });
      setLoading(false);
    }
  };

  if (loginSuccess && user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <Card className="w-full max-w-md border-none shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
          <div className="p-12 text-center space-y-8">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
              <div className="relative bg-primary rounded-[2rem] w-24 h-24 flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
                <ShieldCheck className="w-3 h-3" /> Identity Verified
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                Welcome back<span className="text-primary">.</span>
              </h2>
              <p className="text-slate-500 font-medium">{user.displayName || user.email}</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Mission Registry</span>
                <span className="text-primary">Synchronizing...</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out]" />
              </div>
              <style jsx>{`
                @keyframes progress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Initializing Terminal</span>
            </div>
          </div>
        </Card>
        <p className="mt-12 text-[9px] font-black uppercase tracking-[0.6em] text-slate-300">DNTRNG™ • AUTHENTICATION PROTOCOL COMPLETE</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 transition-all duration-300">
      <div className="flex-1 flex flex-col items-center w-full max-w-md pb-24">
        <Link href="/" className="mb-8">
          <Button variant="ghost" className="rounded-full font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>

        <Card className="w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="text-center pt-12">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 overflow-hidden">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={brandName} className="w-12 h-12 object-contain" />
              ) : (
                <Zap className="w-10 h-10 text-primary fill-current" />
              )}
            </div>
            <CardTitle className="text-3xl font-black tracking-tight uppercase">{brandName} Sign In</CardTitle>
            <CardDescription className="text-base font-medium">Welcome back. Enter your details to continue.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-14 pl-11 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 pl-11 pr-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-16 rounded-full text-lg font-black shadow-xl transition-all hover:scale-[1.02] bg-primary"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Don't have an account?{" "}
                <button 
                  onClick={() => setIsSignUpDialogOpen(true)}
                  className="text-primary font-black hover:underline underline-offset-4 transition-all"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/80 p-6 flex flex-col items-center gap-2 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Security Protocol: Active
            </p>
          </CardFooter>
        </Card>
      </div>

      <SiteFooter className="w-full" />

      <Dialog open={isSignUpDialogOpen} onOpenChange={setIsSignUpDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-2">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Account Required</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 leading-relaxed">
              To access the platform, please contact your administrator to have an account created for you. Once your account is ready, return here and sign in with the credentials provided.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button 
              onClick={() => setIsSignUpDialogOpen(false)}
              className="w-full h-14 rounded-full bg-slate-900 font-black uppercase text-xs tracking-widest"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
