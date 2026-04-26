
/**
 * live/host/[roomCode]/page.tsx
 * 
 * Route: /live/host/[roomCode]
 * Purpose: Command terminal for teachers hosting a live session.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getPusherClient } from '@/lib/pusher';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Play, ChevronRight, CheckCircle2, Clock, Trophy, Copy, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AILoader } from '@/components/ui/ai-loader';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';

export default function LiveHostPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [timer, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Find existing room details in memory via API (simulated with host params)
        // In a real app, you'd fetch the current state from /api/live/room-details
        // For MVP, we use the Pusher events to keep state synced.
        setLoading(false);
      } catch (err) {
        toast({ variant: "destructive", title: "Room Load Error" });
      }
    };

    fetchData();

    // Pusher Sync
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomCode}`);

    channel.bind('student-joined', (data: any) => {
      setRoom((prev: any) => prev ? { ...prev, students: data.students } : { students: data.students });
    });

    channel.bind('student-answered', (data: any) => {
      setAnsweredCount(data.answeredCount);
    });

    return () => {
      pusher.unsubscribe(`room-${roomCode}`);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomCode, user, router]);

  const copyCode = () => {
    navigator.clipboard.writeText(String(roomCode));
    toast({ title: "Copied", description: "Room code committed to clipboard." });
  };

  const startQuiz = async () => {
    // 1. Get Questions from GAS
    setLoading(true);
    try {
      // Find the test ID from memory or local state
      // Assume we store testId in the initial room creation
      // For brevity, fetching a specific module
      const res = await fetch(`/api/live/room-details?code=${roomCode}`); // Add this route or use testId from state
      // Mocking for now:
      setLoading(false);
      handleAction('start_question', { questionIndex: 0, questionData: {}, timeLimit: 30 });
    } catch (e) {}
  };

  const handleAction = async (action: string, data: any = {}) => {
    try {
      await fetch('/api/live/host-action', {
        method: 'POST',
        body: JSON.stringify({ roomCode, action, data, hostId: user?.id || user?.email })
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failure" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><AILoader /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Command Terminal</span>
            <h1 className="text-xl font-black uppercase tracking-tight">Active Room</h1>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-6 py-2.5 rounded-2xl ring-1 ring-white/10">
            <span className="text-2xl font-black tracking-[0.3em] font-mono text-primary">{roomCode}</span>
            <button onClick={copyCode} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">{room?.students?.length || 0} Connected</span>
          </div>
          <Button variant="ghost" onClick={() => router.push('/admin')} className="rounded-full text-slate-400 hover:text-white font-bold uppercase text-[10px] tracking-widest"><LogOut className="w-4 h-4 mr-2" /> Terminate</Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Lobby Sidebar */}
        <div className="lg:col-span-4 border-r border-white/5 bg-slate-900/30 flex flex-col">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> Identity Registry
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {room?.students?.map((s: any) => (
              <div key={s.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between group animate-in slide-in-from-left-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary uppercase">{s.name.charAt(0)}</div>
                  <span className="font-bold text-slate-300">{s.name}</span>
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2">Ready</Badge>
              </div>
            ))}
            {!room?.students?.length && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
                <Loader2 className="w-12 h-12 mb-6 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Waiting for students to initialize connection...</p>
              </div>
            )}
          </div>
        </div>

        {/* Execution Area */}
        <div className="lg:col-span-8 p-12 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full space-y-12 animate-in zoom-in-95 duration-700">
             <div className="text-center space-y-6">
                <h3 className="text-5xl font-black uppercase tracking-tight leading-none text-white">Lobby Initialization</h3>
                <p className="text-xl font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">Ensure all student nodes are connected before beginning the assessment sequence.</p>
             </div>

             <div className="p-10 rounded-[3rem] bg-white/5 border-4 border-dashed border-white/10 flex flex-col items-center text-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Student Gateway</p>
                  <p className="text-2xl font-bold text-white tracking-tight">quest-dntrng.vercel.app/join</p>
                </div>
                <Button 
                  onClick={() => handleAction('start_question', { questionIndex: 0, questionData: {}, timeLimit: 30 })}
                  disabled={!room?.students?.length}
                  className="h-20 px-12 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-2xl uppercase tracking-tighter shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05]"
                >
                  <Play className="w-6 h-6 mr-3 fill-current" /> Start Assessment
                </Button>
             </div>
          </div>
          
          <p className="absolute bottom-12 text-[9px] font-black uppercase tracking-[0.5em] text-white/10">DNTRNG™ • REAL-TIME CLASSROOM PROTOCOL</p>
        </div>
      </main>
    </div>
  );
}
