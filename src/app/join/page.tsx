/**
 * join/page.tsx
 * 
 * Route: /join
 * Purpose: Student entry gateway for live classroom sessions.
 * Updated: v18.9 - Added error parameter handling and session termination awareness.
 */

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ArrowRight, Loader2, User, Key, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { SiteFooter } from '@/components/SiteFooter';

function JoinContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const errorParam = searchParams.get('error');

  // SESSION AUDIT PROTOCOL: Display errors from terminated or restricted sessions
  useEffect(() => {
    if (errorParam === 'session-ended') {
      toast({ 
        variant: "destructive", 
        title: "Session Closed", 
        description: "THIS SESSION HAS ENDED — The host has closed this room." 
      });
    }
  }, [errorParam, toast]);

  // Identity Auto-fill Protocol: Synchronize input with authenticated profile or persistent guest registry
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    } else if (!name) {
      const savedName = localStorage.getItem('dntrng_guest_name');
      if (savedName) setName(savedName);
    }
  }, [user, name]);

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
        // Commit identity to persistent registry for cross-navigation stability
        localStorage.setItem('dntrng_guest_name', name);
        
        toast({ title: "Connected", description: `Joined ${data.hostName}'s session.` });
        router.push(`/live/${roomCode}?studentId=${data.studentId}`);
      } else {
        toast({ variant: "destructive", title: "Join Error", description: data.error || "Could not find room." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failure" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 transition-all duration-300">
      <div className="flex-1 flex flex-col items-center w-full max-w-md pb-24">
        <Link href="/" className="mb-12">
          <img src="/brand/logo-horizontal.png" alt="DNTRNG" className="h-10" />
        </Link>

        <Card className="w-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-10 text-white text-center">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">Live Entry</CardTitle>
            <CardDescription className="text-white/60 font-bold uppercase text-[10px] tracking-widest mt-2">Classroom Session Protocol</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-12">
            {errorParam === 'session-ended' && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">This session has ended.</p>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Room Access Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="E.G. K4X9M2"
                    maxLength={6}
                    className="h-14 pl-11 text-xl font-black tracking-[0.2em] rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name for registry"
                    className="h-14 pl-11 font-bold rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !roomCode || !name}
                className="w-full h-16 rounded-full bg-primary font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all border-none"
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
