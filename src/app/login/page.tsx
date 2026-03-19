"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, LogIn, Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Access Granted",
        description: "Authenticated with DNTRNG identity provider.",
      });
      router.push('/tests');
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials. Access denied.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Button variant="ghost" className="rounded-full font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Home
        </Button>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="h-3 bg-primary" />
        <CardHeader className="text-center pt-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-primary fill-current" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight uppercase">DNTRNG Login</CardTitle>
          <CardDescription className="text-base font-medium">Platform authentication required.</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Identity (Email)</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  id="email"
                  type="email"
                  placeholder="name@dntrng.com"
                  className="h-14 pl-11 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Secure Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-11 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
              Authenticate
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50/80 p-8 flex flex-col items-center gap-2 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Protected by DNTRNG Cloud Identity
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}