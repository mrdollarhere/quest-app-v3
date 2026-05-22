/**
 * live/host/[roomCode]/page.tsx
 * 
 * Route: /live/host/[roomCode]
 * Purpose: Command terminal for teachers hosting a live session.
 * Refactored: v19.2.1 - Migrated to secure proxy nodes for question retrieval.
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getPusherClient } from '@/lib/pusher';
import { Button } from "@/components/ui/button";
import { Copy, Flag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AILoader } from '@/components/ui/ai-loader';
import { Question } from '@/types/quiz';
import { DEMO_QUESTIONS } from '@/app/lib/demo-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog";

// Refactored Sub-components
import { HostSidebar } from '@/components/live/HostSidebar';
import { HostLobbyView } from '@/components/live/HostLobbyView';
import { HostQuestionView } from '@/components/live/HostQuestionView';

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
  const [status, setStatus] = useState<'lobby' | 'active' | 'revealed'>('lobby');
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);

  const hasStudents = room?.students && room.students.length > 0;
  const hasQuestions = questions && questions.length > 0;
  
  const canStartAssessment = useMemo(() => {
    return hasStudents && hasQuestions && !loading && !sessionStarted;
  }, [hasStudents, hasQuestions, loading, sessionStarted]);

  const initTerminal = useCallback(async (retryCount = 0) => {
    if (!roomCode) return;
    let shouldFinishLoading = true;
    try {
      const roomRes = await fetch(`/api/live/room-details?code=${roomCode}`);
      if (roomRes.status === 404) {
        toast({ variant: "destructive", title: "Room Not Found" });
        router.push('/admin');
        return;
      }
      const roomData = await roomRes.json();
      setRoom(roomData);

      if (roomData.testId) {
        // REGISTRY PROTOCOL: Use secure admin proxy for question retrieval
        if (String(roomData.testId).includes('demo')) {
          setQuestions(DEMO_QUESTIONS);
        } else {
          const qRes = await fetch(`/api/proxy/admin/questions?id=${roomData.testId}`);
          if (!qRes.ok) throw new Error('Proxy unreachable');
          const qData = await qRes.json();
          const validQuestions = Array.isArray(qData) ? qData : [];
          
          if (validQuestions.length === 0 && retryCount < 2) {
            shouldFinishLoading = false;
            setTimeout(() => initTerminal(retryCount + 1), 1000);
            return;
          }
          setQuestions(validQuestions);
        }
      }
    } catch (err) {
      if (retryCount < 2) {
        shouldFinishLoading = false;
        setTimeout(() => initTerminal(retryCount + 1), 1000);
        return;
      }
      toast({ variant: "destructive", title: "Sync Failure", description: "Could not retrieve mission data." });
    } finally {
      if (shouldFinishLoading) setLoading(false);
    }
  }, [roomCode, router, toast]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { 
      // Safe navigation for non-admin nodes
      return; 
    }
    initTerminal();
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomCode}`);
    
    channel.bind('student-joined', (data: any) => {
      setRoom((prev: any) => ({ ...prev, students: data.students || prev.students, studentCount: data.totalStudents }));
    });
    channel.bind('student-answered', (data: any) => { setAnsweredCount(data.answeredCount); });
    channel.bind('answer-reveal', (data: any) => { setLeaderboard(data.leaderboard); setStatus('revealed'); });
    
    return () => { pusher.unsubscribe(`room-${roomCode}`); };
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
    if (!canStartAssessment) return;
    setSessionStarted(true); 
    setStatus('active'); 
    setAnsweredCount(0);
    handleAction('start_question', { questionIndex: 0, questionData: questions[0], timeLimit: 30 });
  };

  const revealAnswer = () => handleAction('reveal_answer', {});

  const nextQuestion = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx); 
      setStatus('active'); 
      setAnsweredCount(0);
      handleAction('start_question', { questionIndex: nextIdx, questionData: questions[nextIdx], timeLimit: 30 });
    } else {
      setIsEndConfirmOpen(true);
    }
  };

  const handleEndMission = async () => {
    await handleAction('end_session', {});
    router.push(`/live/results/${roomCode}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><AILoader /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Command Terminal</span>
            <h1 className="text-xl font-black uppercase tracking-tight truncate max-w-[200px]">{room?.testName || 'Active Room'}</h1>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-6 py-2.5 rounded-2xl ring-1 ring-white/10">
            <span className="text-2xl font-black tracking-[0.3em] font-mono text-primary">{roomCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(String(roomCode)); toast({ title: "Copied" }); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Copy className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-slate-500">Node Cluster</span>
               <span className="text-xs font-bold text-emerald-500">{room?.studentCount || 0} Synchronized</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <AlertDialog open={isEndConfirmOpen} onOpenChange={setIsEndConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="rounded-full text-slate-400 hover:text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/5"><Flag className="w-4 h-4 mr-2" /> End Mission</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white text-slate-900">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Finalize Assessment?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                  This will terminate the session for all connected student nodes and permanently archive the results registry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 gap-3">
                <AlertDialogCancel className="rounded-full font-bold uppercase text-[10px] tracking-widest h-12">Resume</AlertDialogCancel>
                <AlertDialogAction onClick={handleEndMission} className="rounded-full bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest h-12 border-none shadow-xl shadow-rose-500/20">Finalize & Exit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        <HostSidebar status={status} students={room?.students} leaderboard={leaderboard} />

        <div className="lg:col-span-9 p-12 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
          {!sessionStarted ? (
            <HostLobbyView 
              testName={room?.testName} 
              studentCount={room?.studentCount} 
              questionCount={questions.length}
              canStart={canStartAssessment}
              onStart={startQuiz}
            />
          ) : (
            <HostQuestionView 
              currentIdx={currentIdx}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              studentCount={room?.studentCount}
              question={questions[currentIdx]}
              status={status}
              onReveal={revealAnswer}
              onNext={nextQuestion}
            />
          )}
        </div>
      </main>
    </div>
  );
}
