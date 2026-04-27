/**
 * live/host/[roomCode]/page.tsx
 * 
 * Route: /live/host/[roomCode]
 * Purpose: Command terminal for teachers hosting a live session.
 * Used by: Admin operators.
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getPusherClient } from '@/lib/pusher';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Play, CheckCircle2, Clock, Trophy, Copy, LogOut, Loader2, Radio, ArrowRight, ListChecks, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AILoader } from '@/components/ui/ai-loader';
import { Question } from '@/types/quiz';
import { API_URL } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { DEMO_QUESTIONS } from '@/app/lib/demo-data';

export default function LiveHostPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [room, setRoom] = useState<any>({ students: [], studentCount: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [status, setStatus] = useState<'lobby' | 'question' | 'revealed'>('lobby');

  // REGISTRY LOGIC CONSOLIDATION (v18.9)
  const hasStudents = room?.students && room.students.length > 0;
  const hasQuestions = questions && questions.length > 0;
  
  // Protocol: canStartAssessment is the singular source of truth for the primary action node
  // REQUIREMENT: Must evaluate to true only if participants > 0 AND all are 'READY' (assumed status check)
  const canStartAssessment = useMemo(() => {
    if (!hasStudents || !hasQuestions || loading || sessionStarted) return false;
    // Strict Status Check: Verify every student node has reported a 'READY' handshake
    return room.students.every((s: any) => s.status === 'READY' || !('status' in s)); 
  }, [hasStudents, hasQuestions, loading, sessionStarted, room?.students]);

  // FORENSIC DIAGNOSTICS: Execute on every render cycle for terminal visibility
  useEffect(() => {
    console.log('[LOBBY DIAGNOSTIC AUDIT]', {
      roomCode,
      loadingState: loading,
      nodeCount: room?.students?.length || 0,
      participantRegistry: room?.students,
      intelligenceBankSize: questions.length,
      hasQuestions,
      canStart: canStartAssessment,
      syncConditions: {
        expected: questions.length > 0,
        actual: questions.length,
        status: questions.length > 0 ? 'SYNCED' : 'UNSYNCHRONIZED'
      },
      timestamp: new Date().toISOString()
    });
  }, [room, questions, loading, canStartAssessment, roomCode, hasQuestions]);

  const initTerminal = useCallback(async (retryCount = 0) => {
    try {
      // GAS: getRoomDetails
      const roomRes = await fetch(`/api/live/room-details?code=${roomCode}`);
      
      if (roomRes.status === 404) {
        toast({ variant: "destructive", title: "Room Not Found", description: "This session may have expired." });
        router.push('/admin');
        return;
      }

      const roomData = await roomRes.json();
      setRoom(roomData);

      // GAS: getQuestions - Intelligence Node Fetch Protocol
      if (roomData.testId) {
        console.log(`[Registry Fetch] Initializing Intelligence Sync for Module: ${roomData.testId}`);
        
        if (!API_URL) {
          console.warn('[Registry Sync] API_URL missing. Checking for demo fallback...');
          if (String(roomData.testId).includes('demo')) {
            setQuestions(DEMO_QUESTIONS);
            setLoading(false);
            return;
          }
          throw new Error('API_URL_MISSING');
        }

        const qRes = await fetch(`${API_URL}?action=getQuestions&id=${roomData.testId}`);
        const qData = await qRes.json();
        const validQuestions = Array.isArray(qData) ? qData : [];
        
        if (validQuestions.length === 0 && retryCount < 2) {
          console.warn(`[Sync Retry ${retryCount + 1}] Intelligence bank empty for ${roomData.testId}. Retrying in 1s...`);
          setTimeout(() => initTerminal(retryCount + 1), 1000);
          return;
        }

        setQuestions(validQuestions);
      } else {
        console.error('[Registry Error] Room data contains no intelligence reference (testId).');
      }
    } catch (err) {
      console.error('[Sync Failure] Registry nodes failed to report:', err);
      if (retryCount < 2) {
        setTimeout(() => initTerminal(retryCount + 1), 1000);
        return;
      }
    } finally {
      // Ensure we only exit loading after retries are exhausted or success
      if (retryCount >= 2 || (room?.testId && questions.length > 0)) {
        setLoading(false);
      }
    }
  }, [roomCode, router, toast, questions.length, room?.testId]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    initTerminal();

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomCode}`);

    channel.bind('student-joined', (data: any) => {
      console.log('[Real-time] Registry update: Student joined', data.studentName);
      // Ensure students joined in real-time are also marked as READY for the canStartAssessment check
      const enrichedStudents = (data.students || []).map((s: any) => ({ ...s, status: 'READY' }));
      setRoom((prev: any) => ({ 
        ...prev, 
        students: enrichedStudents, 
        studentCount: data.totalStudents 
      }));
    });

    channel.bind('student-answered', (data: any) => {
      setAnsweredCount(data.answeredCount);
    });

    channel.bind('answer-reveal', (data: any) => {
      setLeaderboard(data.leaderboard);
      setStatus('revealed');
    });

    return () => {
      pusher.unsubscribe(`room-${roomCode}`);
    };
  }, [roomCode, user, router, initTerminal]);

  const handleAction = async (action: string, data: any = {}) => {
    try {
      await fetch('/api/live/host-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, action, data, hostId: user?.id || user?.email })
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Transmission Error" });
    }
  };

  const startQuiz = () => {
    if (!canStartAssessment) {
      console.error('[Action Blocked] canStartAssessment evaluation failed during click phase.');
      return;
    }
    setSessionStarted(true);
    setStatus('question');
    setAnsweredCount(0);
    handleAction('start_question', { 
      questionIndex: 0, 
      questionData: questions[0], 
      timeLimit: 30 
    });
  };

  const revealAnswer = () => {
    handleAction('reveal_answer', {});
  };

  const nextQuestion = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setStatus('question');
      setAnsweredCount(0);
      handleAction('start_question', { 
        questionIndex: nextIdx, 
        questionData: questions[nextIdx], 
        timeLimit: 30 
      });
    } else {
      handleAction('end_session', {});
      router.push('/admin/responses');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><AILoader /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Command Terminal</span>
            <h1 className="text-xl font-black uppercase tracking-tight">{room?.testName || 'Active Room'}</h1>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-6 py-2.5 rounded-2xl ring-1 ring-white/10">
            <span className="text-2xl font-black tracking-[0.3em] font-mono text-primary">{roomCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(String(roomCode)); toast({ title: "Copied" }); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-slate-500">Registry Nodes</span>
               <span className="text-xs font-bold text-emerald-500">{room?.studentCount || 0} Connected</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Button variant="ghost" onClick={() => router.push('/admin')} className="rounded-full text-slate-400 hover:text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/5"><LogOut className="w-4 h-4 mr-2" /> Terminate</Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Sidebar: Lobby or Leaderboard */}
        <div className="lg:col-span-3 border-r border-white/5 bg-slate-900/30 flex flex-col">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              {status === 'revealed' ? <Trophy className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
              {status === 'revealed' ? 'Top Performance' : 'Identity Registry'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {status === 'revealed' ? (
              leaderboard.map((s: any, i) => (
                <div key={s.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-500 w-4">{i + 1}</span>
                    <span className="font-bold text-slate-300">{s.name}</span>
                  </div>
                  <span className="text-sm font-black text-primary">{s.score}</span>
                </div>
              ))
            ) : (
              room?.students?.map((s: any) => (
                <div key={s.id} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between group animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary uppercase text-xs">{s.name.charAt(0)}</div>
                    <span className="font-bold text-slate-300">{s.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500 bg-emerald-50/5 px-2">Ready</Badge>
                </div>
              ))
            )}
            {!room?.students?.length && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
                <Loader2 className="w-12 h-12 mb-6 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Awaiting Connections...</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Content Area */}
        <div className="lg:col-span-9 p-12 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
          {!sessionStarted ? (
            <div className="max-w-2xl w-full space-y-12 text-center animate-in zoom-in-95 duration-700 relative z-10">
               <div className="space-y-6">
                  <h3 className="text-5xl font-black uppercase tracking-tight leading-none text-white">Lobby Ready</h3>
                  <p className="text-xl font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">Sync protocol established. Initialize the assessment sequence when all student nodes are connected.</p>
               </div>

               <div className="p-10 rounded-[3rem] bg-white/5 border-4 border-dashed border-white/10 flex flex-col items-center gap-8 relative z-20 pointer-events-auto">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Join URL</p>
                      <p className="text-2xl font-bold text-white tracking-tight">questflow.vercel.app/join</p>
                    </div>
                    {/* Status Diagnostics */}
                    <div className="flex items-center justify-center gap-6 py-4 border-t border-white/10 mt-2">
                      <div className="flex items-center gap-2">
                        <Users className={cn("w-3.5 h-3.5", hasStudents ? "text-emerald-500" : "text-slate-500")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", hasStudents ? "text-emerald-500" : "text-slate-500")}>
                          {room?.students?.length || 0} Ready
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ListChecks className={cn("w-3.5 h-3.5", hasQuestions ? "text-emerald-500" : "text-rose-500")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", hasQuestions ? "text-emerald-500" : "text-rose-500")}>
                          {questions.length} Items
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={startQuiz}
                    disabled={!canStartAssessment}
                    className={cn(
                      "h-20 px-12 rounded-full font-black text-2xl uppercase tracking-tighter shadow-2xl transition-all border-none relative z-30",
                      !canStartAssessment 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50" 
                        : "bg-primary hover:bg-primary/90 text-white hover:scale-[1.05] shadow-primary/30 cursor-pointer"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    ) : (
                      <Play className="w-6 h-6 mr-3 fill-current" />
                    )}
                    Start Assessment
                  </Button>
                  
                  {!hasQuestions && !loading && (
                    <p className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-2 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Error: Intelligence Nodes Not Synchronized
                    </p>
                  )}
               </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <ListChecks className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Question {currentIdx + 1} of {questions.length}</p>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Intelligence Transmission</h3>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-slate-500">Live Progress</p>
                     <p className="text-xl font-black text-primary tabular-nums">{answeredCount} / {room?.studentCount}</p>
                   </div>
                   <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                     <Clock className="w-6 h-6 text-primary" />
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 text-slate-900 shadow-2xl">
                <QuestionRenderer 
                  question={questions[currentIdx]} 
                  value={null} 
                  onChange={() => {}} 
                  reviewMode={status === 'revealed'} 
                />
              </div>

              <div className="flex justify-center gap-6 pt-4">
                {status === 'question' ? (
                  <Button 
                    onClick={revealAnswer}
                    disabled={answeredCount === 0}
                    className="h-16 px-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg uppercase shadow-xl transition-all hover:scale-[1.02] border-none"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-3" /> Reveal Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-lg uppercase shadow-xl transition-all hover:scale-[1.02] border-none"
                  >
                    {currentIdx === questions.length - 1 ? 'End Mission' : 'Next Question'} 
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <p className="absolute bottom-10 text-[9px] font-black uppercase tracking-[0.5em] text-white/5">DNTRNG™ • REAL-TIME CLASSROOM PROTOCOL</p>
        </div>
      </main>
    </div>
  );
}
