
/**
 * join/page.tsx
 * 
 * Route: /join
 * Purpose: Student entry gateway for live classroom sessions.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ArrowRight, Loader2, User, Key } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function JoinPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  // Identity Auto-fill Protocol: Synchronize input with authenticated profile on load
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="mb-12">
        <img src="/brand/logo-horizontal.png" alt="DNTRNG" className="h-10" />
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary p-10 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tight">Live Entry</CardTitle>
          <CardDescription className="text-white/60 font-bold uppercase text-[10px] tracking-widest mt-2">Classroom Session Protocol</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-12">
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
      
      <p className="mt-8 text-[9px] font-black uppercase tracking-[0.6em] text-slate-300">DNTRNG™ • LIVE CLASSROOM ENGINE</p>
    </div>
  );
}
