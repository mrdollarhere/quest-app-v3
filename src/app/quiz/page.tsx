
/**
 * page.tsx (Quiz)
 * 
 * Route: /quiz
 * Purpose: Primary interaction terminal for all assessment modules.
 * Refactored: v19.1.0 - Streamlined loading protocols for high-velocity navigation.
 */

"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { QuizState, QuizMode } from '@/types/quiz';
import { QuizStart } from '@/components/quiz/QuizStart';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizActive } from '@/components/quiz/QuizActive';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { trackEvent } from '@/lib/tracker';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizLoadingManager } from '@/components/quiz/lifecycle/QuizLoadingManager';

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isSyncingTraining, setIsSyncingTraining] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); 
  const [isWrongInRace, setIsWrongInRace] = useState(false);
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null);
  const [serverReviewData, setServerReviewData] = useState<any[]>([]);
  const [finalDuration, setFinalDuration] = useState<number>(0);

  // REDUCED LATENCY LIFECYCLE STATES
  const [isInitialVisuallyLoading, setIsInitialVisuallyLoading] = useState(true);
  const [isInitialDataReady, setIsInitialDataReady] = useState(false);
  
  const [isSubmittingVisually, setIsSubmittingVisually] = useState(false);
  const [isSubmissionDataReady, setIsSubmissionDataReady] = useState(false);
  const [pendingSubmissionResult, setPendingSubmissionResult] = useState<any>(null);
  
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isSubmitted: false,
    score: 0,
    startTime: Date.now(),
    mode: 'test',
    highestStepReached: 0,
    flaggedQuestionIds: []
  });

  const quizStartTimeRef = useRef<number | null>(null);

  const { data: questionsData, isLoading: qLoading, error: qError } = useSWR(
    testId ? `/api/proxy/questions?id=${testId}` : null
  );

  const { data: globalData, isLoading: configLoading } = useSWR(
    '/api/proxy/settings',
    async (url) => {
      const [sRes, tRes] = await Promise.all([fetch('/api/proxy/settings'), fetch('/api/proxy/tests')]);
      const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
      return {
        tests: Array.isArray(tData) ? tData : [],
        salt: sData.daily_key_salt || "",
        protection: String(sData.access_key_protection_enabled ?? "true") !== "false",
        guest: String(sData.guest_access_allowed ?? "true") !== "false",
        maintenance: String(sData.maintenance_mode ?? "false") === "true",
        globalTimer: sData.global_timer_limit || "15",
        defaultThreshold: sData.default_pass_threshold || "70"
      };
    }
  );

  useEffect(() => {
    if (!qLoading && !configLoading && !!questionsData && !!globalData) setIsInitialDataReady(true);
  }, [qLoading, configLoading, questionsData, globalData]);

  const finalizeSubmission = () => {
    if (!pendingSubmissionResult) return;
    const data = pendingSubmissionResult;
    const testMetadata = globalData?.tests.find(t => String(t.id) === String(testId));
    const passingThreshold = Number(testMetadata?.passing_threshold || globalData?.defaultThreshold || 70);
    const isPassed = Math.round((data.score / (data.total || 1)) * 100) >= passingThreshold;
    
    if (isPassed && testMetadata?.certificate_enabled !== 'FALSE') setGeneratedCertificateId(data.certificateId);
    setServerReviewData(data.reviewData || []);
    setQuiz(prev => ({ ...prev, isSubmitted: true, score: data.score, endTime: Date.now() }));
    if (user?.email) globalMutate(`results-${user.email}`);
    setIsSubmittingVisually(false); setIsSubmissionDataReady(false); setPendingSubmissionResult(null);
  };

  const submit = async () => {
    if (isSubmittingVisually) return;
    const now = Date.now();
    const duration = now - (quizStartTimeRef.current || now);
    setFinalDuration(duration);
    setIsSubmittingVisually(true);
    try {
      const res = await fetch('/api/proxy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, responses: quiz.responses, userName: user?.displayName || guestName || 'Guest User', userEmail: user?.email || 'Anonymous', duration, mode: quiz.mode, certificateId: `CRT-${testId}-${now.toString().slice(-6)}`.toUpperCase() })
      });
      const data = await res.json();
      if (res.ok) { 
        setPendingSubmissionResult(data); 
        setIsSubmissionDataReady(true); 
      }
      else throw new Error(data.error);
    } catch (e: any) {
      setIsSubmittingVisually(false); toast({ variant: "destructive", title: "Submission Failure" });
    }
  };

  const handleStart = async (mode: QuizMode) => {
    let q = questionsData || [];
    if (mode === 'training') {
      setIsSyncingTraining(true);
      try { const res = await fetch(`/api/proxy/questions?id=${testId}&training=true`); q = await res.json(); }
      catch (e) { toast({ variant: "destructive", title: "Sync Error" }); setIsSyncingTraining(false); return; }
      setIsSyncingTraining(false);
    }
    if (!q || q.length === 0) return;
    if (mode === 'test') q = [...q].sort(() => Math.random() - 0.5);
    setTimeLeft(Number(globalData?.globalTimer || 0) > 0 ? Number(globalData?.globalTimer) * 60 : 900);
    quizStartTimeRef.current = Date.now();
    setIsStarted(true); setQuiz(prev => ({ ...prev, questions: q, mode, currentQuestionIndex: 0, responses: [] }));
  };

  if (globalData?.maintenance) return <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"><AlertCircle className="w-12 h-12 text-amber-500 mb-6" /><h2 className="text-3xl font-black text-slate-900 uppercase">Maintenance Mode</h2><Button onClick={() => router.push('/')} className="mt-8 rounded-full">Return Home</Button></div>;
  if (qError || (questionsData && questionsData.length === 0)) return <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"><AlertCircle className="w-16 h-16 text-rose-500 mb-6" /><h2 className="text-3xl font-black text-slate-900">Module Empty</h2><Button onClick={() => router.push('/tests')} className="mt-8 rounded-full">Return to Library</Button></div>;

  if (isInitialVisuallyLoading || isSyncingTraining || isSubmittingVisually) {
    return (
      <QuizLoadingManager 
        isSubmitting={isSubmittingVisually} isSubmissionDataReady={isSubmissionDataReady} onSubmissionComplete={finalizeSubmission}
        isInitialLoading={isInitialVisuallyLoading} isInitialDataReady={isInitialDataReady} onInitialComplete={() => setIsInitialVisuallyLoading(false)}
        isSyncingTraining={isSyncingTraining}
      />
    );
  }

  if (!isStarted) return <QuizStart title={globalData?.tests.find(t => String(t.id) === String(testId))?.title || 'Assessment'} questionsCount={questionsData?.length || 0} user={user} guestName={guestName} setGuestName={setGuestName} protocolSalt={globalData?.salt} isProtectionEnabled={globalData?.protection} guestAccessAllowed={globalData?.guest} onStart={handleStart} testId={testId || undefined} />;
  if (quiz.isSubmitted) return <QuizResults title={globalData?.tests.find(t => String(t.id) === String(testId))?.title || 'Assessment'} score={quiz.score} totalQuestions={quiz.questions.length} questions={quiz.questions} responses={quiz.responses} serverReviewData={serverReviewData} userName={user?.displayName || guestName || 'Guest User'} onRestart={() => { setIsStarted(false); setQuiz(prev => ({...prev, isSubmitted: false, responses: []})); }} certificateId={generatedCertificateId || undefined} duration={finalDuration} />;

  return <QuizActive quiz={quiz} quizTitle={globalData?.tests.find(t => String(t.id) === String(testId))?.title || 'Assessment'} timeLeft={timeLeft} isWrongInRace={isWrongInRace} onResponseChange={(val) => { const q = quiz.questions[quiz.currentQuestionIndex]; const updated = [...quiz.responses]; const idx = updated.findIndex(r => r.questionId === q.id); if (idx > -1) updated[idx].answer = val; else updated.push({ questionId: q.id, answer: val }); setQuiz({ ...quiz, responses: updated }); }} onConfirmResponse={() => { const q = quiz.questions[quiz.currentQuestionIndex]; const updated = [...quiz.responses]; const idx = updated.findIndex(r => r.questionId === q.id); if (idx > -1) { updated[idx].isConfirmed = true; setQuiz({ ...quiz, responses: updated }); } }} onNext={() => { if (quiz.currentQuestionIndex < quiz.questions.length - 1) { const nextIdx = quiz.currentQuestionIndex + 1; setQuiz({ ...quiz, currentQuestionIndex: nextIdx, highestStepReached: Math.max(quiz.highestStepReached, nextIdx) }); } }} onPrev={() => setQuiz({ ...quiz, currentQuestionIndex: Math.max(0, quiz.currentQuestionIndex - 1) })} onSubmit={submit} onJump={(i) => setQuiz({ ...quiz, currentQuestionIndex: i })} onToggleFlag={(id) => { setQuiz(prev => ({ ...prev, flaggedQuestionIds: prev.flaggedQuestionIds?.includes(id) ? prev.flaggedQuestionIds.filter(f => f !== id) : [...(prev.flaggedQuestionIds || []), id] })); }} />;
}

export default function QuizPage() {
  return <Suspense fallback={null}><QuizContent /></Suspense>;
}
