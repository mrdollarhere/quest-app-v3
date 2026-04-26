
/**
 * live/[roomCode]/page.tsx
 * 
 * Route: /live/[roomCode]
 * Purpose: Student terminal for synchronized live assessments.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { AILoader } from '@/components/ui/ai-loader';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, CheckCircle2, XCircle, Users, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LiveStudentPage() {
  const { roomCode } = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<'waiting' | 'question' | 'revealed' | 'ended'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!studentId || !roomCode) {
      router.push('/join');
      return;
    }

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomCode}`);

    channel.bind('question-start', (data: any) => {
      setCurrentQuestion(data.questionData);
      setCurrentAnswer(null);
      setResult(null);
      setStatus('question');
      setTimeLeft(data.timeLimit);
    });

    channel.bind('student-answered', (data: any) => {
      setAnsweredCount(data.answeredCount);
      setTotalStudents(data.totalStudents);
    });

    channel.bind('answer-reveal', (data: any) => {
      const myResult = data.studentResults.find((s: any) => s.id === studentId);
      setResult(myResult);
      setLeaderboard(data.leaderboard);
      setStatus('revealed');
    });

    channel.bind('session-ended', (data: any) => {
      setLeaderboard(data.finalLeaderboard);
      setStatus('ended');
    });

    return () => {
      pusher.unsubscribe(`room-${roomCode}`);
    };
  }, [roomCode, studentId, router]);

  const submitAnswer = async (answer: any) => {
    if (status !== 'question' || currentAnswer) return;
    setCurrentAnswer(answer);
    try {
      await fetch('/api/live/student-answer', {
        method: 'POST',
        body: JSON.stringify({ roomCode, studentId, answer })
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failure" });
    }
  };

  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="max-w-md w-full space-y-12">
          <div className="mx-auto w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center ring-4 ring-primary/10 animate-pulse">
            <Zap className="w-12 h-12 text-primary fill-current" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tight">Synchronizing...</h1>
            <p className="text-lg font-medium text-slate-400">Connected to room <span className="text-white font-black">{roomCode}</span>. Waiting for host to initialize the next step.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5"><p className="text-[10px] font-black uppercase text-slate-500 mb-1">Status</p><p className="font-bold">Authorized</p></div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5"><p className="text-[10px] font-black uppercase text-slate-500 mb-1">Identity</p><p className="font-bold">Verified</p></div>
          </div>
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (status === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-primary/10 rounded-xl"><Clock className="w-4 h-4 text-primary" /></div>
             <span className="text-2xl font-black tabular-nums">{timeLeft !== null ? `${timeLeft}s` : '---'}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase text-slate-400">Global Progress</span>
            <span className="text-xs font-bold text-primary">{answeredCount} / {totalStudents} Answered</span>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-12 animate-in fade-in duration-500">
          <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-slate-100">
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentAnswer} 
              onChange={submitAnswer} 
              reviewMode={!!currentAnswer} 
            />
            {currentAnswer && (
              <div className="mt-10 p-8 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200 text-center animate-in zoom-in-95">
                <p className="text-lg font-black uppercase tracking-tight text-blue-600">Answer Transmitted</p>
                <p className="text-sm font-medium text-blue-400 mt-1">Waiting for terminal reveal protocol...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (status === 'revealed' && result) {
    const isCorrect = result.correct;
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 text-center text-white", isCorrect ? "bg-emerald-500" : "bg-rose-500")}>
        <div className="max-w-md w-full space-y-10 animate-in zoom-in-95 duration-500">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
            {isCorrect ? <CheckCircle2 className="w-20 h-20 text-emerald-500" /> : <XCircle className="w-20 h-20 text-rose-500" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black uppercase tracking-tighter">{isCorrect ? 'Correct!' : 'Incorrect'}</h2>
            <p className="text-xl font-bold opacity-80">{isCorrect ? '+100 Intelligence Points' : 'Identity Alignment Error'}</p>
          </div>
          <div className="p-8 bg-white/20 backdrop-blur-md rounded-[2.5rem] border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Current Score</p>
            <p className="text-6xl font-black tracking-tighter">{result.score}</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">Waiting for host to cycle step...</p>
        </div>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center py-20 px-8 text-white">
        <div className="max-w-2xl w-full space-y-12 text-center animate-in fade-in duration-1000">
          <div className="space-y-4">
            <Trophy className="w-20 h-20 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
            <h1 className="text-5xl font-black uppercase tracking-tight leading-none">Assessment Complete</h1>
            <p className="text-xl font-medium text-slate-400">Real-time performance audit finalized.</p>
          </div>

          <Card className="border-none bg-white/5 rounded-[3rem] overflow-hidden">
            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Final Leaderboard</h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {leaderboard.slice(0, 5).map((s, i) => (
                  <div key={s.id} className={cn(
                    "p-6 flex items-center justify-between",
                    s.id === studentId ? "bg-primary/20" : ""
                  )}>
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black text-slate-500 w-8">{i + 1}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-black uppercase tracking-tight text-white">{s.name}</span>
                        {s.id === studentId && <span className="text-[8px] font-black uppercase tracking-widest text-primary">Your Identity</span>}
                      </div>
                    </div>
                    <span className="text-2xl font-black text-primary tabular-nums">{s.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Link href="/tests" className="block w-full">
            <Button className="w-full h-20 rounded-full bg-primary text-white font-black text-2xl uppercase tracking-tight shadow-2xl border-none">
              <ArrowLeft className="w-6 h-6 mr-3" /> Back to Base
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen flex items-center justify-center bg-slate-900"><AILoader /></div>;
}
