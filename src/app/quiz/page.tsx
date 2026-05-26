/**
 * page.tsx (Quiz)
 * 
 * Route: /quiz
 * Purpose: Primary interaction terminal for all assessment modules.
 * Refactored: v19.2.3 - Implemented Registry Reset Protocol for testId transitions.
 * Updated: v19.8.5 - Added Navigation Protection and Leave Confirmation.
 */

"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { QuizState, QuizMode } from '@/types/quiz';
import { QuizStart } from '@/components/quiz/QuizStart';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizActive } from '@/components/quiz/QuizActive';
import { AntiCheatModal } from '@/components/quiz/AntiCheatModal';
import { LeaveConfirmationModal } from '@/components/quiz/LeaveConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { trackEvent } from '@/lib/tracker';
import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizLoadingManager } from '@/components/quiz/lifecycle/QuizLoadingManager';
import { BugReportButton } from '@/components/shared/BugReportButton';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';
import { isBanned, getSpamRecord, recordOffense, clearRecord, SpamRecord } from '@/lib/spam-guard';
import { recordViolation, resetViolations } from '@/lib/anti-cheat';
import { MaintenanceView } from '@/components/quiz/MaintenanceView';

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const clearBanParam = searchParams.get('clearBan');
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
  const [spamResult, setSpamResult] = useState<SpamRecord | null>(null);

  // MODAL STATES
  const [isCheatWarningOpen, setIsCheatWarningOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [antiCheatViolation, setAntiCheatViolation] = useState({ flagged: false, count: 0 });

  // LIFECYCLE STATES
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
  const navigationPushedRef = useRef(false);

  useEffect(() => {
    setIsStarted(false);
    setIsInitialVisuallyLoading(true);
    setIsInitialDataReady(false);
    setGeneratedCertificateId(null);
    setServerReviewData([]);
    setIsWrongInRace(false);
    resetViolations();
    setAntiCheatViolation({ flagged: false, count: 0 });
    navigationPushedRef.current = false;
    setQuiz({
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
    quizStartTimeRef.current = null;
  }, [testId]);

  // NAVIGATION PROTECTION PROTOCOL 1: BROWSER CLOSE/REFRESH
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !quiz.isSubmitted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStarted, quiz.isSubmitted]);

  // NAVIGATION PROTECTION PROTOCOL 2: BACK BUTTON INTERCEPTION
  useEffect(() => {
    if (isStarted && !quiz.isSubmitted && !navigationPushedRef.current) {
      window.history.pushState(null, '', window.location.href);
      navigationPushedRef.current = true;
    }
  }, [isStarted, quiz.isSubmitted]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isStarted && !quiz.isSubmitted) {
        // Force stay on current URL
        window.history.pushState(null, '', window.location.href);
        setIsLeaveModalOpen(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isStarted, quiz.isSubmitted]);

  // ANTI-CHEAT MONITORING PROTOCOL
  useEffect(() => {
    if (!isStarted || quiz.isSubmitted || quiz.mode === 'training' || isCheatWarningOpen || isLeaveModalOpen) return;

    const handleViolationTrigger = (type: string) => {
      const result = recordViolation(type);
      setAntiCheatViolation({
        count: result.count,
        flagged: (result.action as string) === 'flag' || antiCheatViolation.flagged
      });
      setIsCheatWarningOpen(true);
      trackEvent('integrity_violation', { type, details: { count: result.count } });
    };

    const handleVisibility = () => { if (document.hidden) handleViolationTrigger('tab_switch'); };
    const handleBlur = () => { handleViolationTrigger('window_blur'); };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isStarted, quiz.isSubmitted, quiz.mode, isCheatWarningOpen, isLeaveModalOpen, antiCheatViolation.flagged]);

  // SPAM GUARD REGISTRY SYNC
  useEffect(() => {
    if (clearBanParam === 'true' && user?.role === 'admin') {
      clearRecord();
      toast({ title: "Ban record cleared" });
      setSpamResult(null);
    }
    
    if (isBanned()) {
      setSpamResult(getSpamRecord());
    }
  }, [clearBanParam, user, toast, testId]);

  useEffect(() => {
    if (!user) {
      const savedName = localStorage.getItem('dntrng_guest_name');
      if (savedName && savedName.trim() !== "") setGuestName(savedName);
    }
  }, [user]);

  // TIMER PROTOCOL: Pauses during Anti-Cheat or Leave confirmation
  useEffect(() => {
    if (!isStarted || quiz.isSubmitted || isCheatWarningOpen || isLeaveModalOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          submit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, quiz.isSubmitted, isCheatWarningOpen, isLeaveModalOpen]);

  const { data: questionsData, isLoading: qLoading } = useSWR(
    testId ? `/api/proxy/questions?id=${testId}` : null
  );

  const { data: globalData, isLoading: configLoading } = useSWR(
    '/api/proxy/settings',
    async () => {
      const [sRes, tRes] = await Promise.all([fetch('/api/proxy/settings'), fetch('/api/proxy/tests')]);
      const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
      return {
        tests: Array.isArray(tData) ? tData : [],
        salt: sData.daily_key_salt || "",
        protection: String(sData.access_key_protection_enabled ?? "true") !== "false",
        guest: String(sData.guest_access_allowed ?? "true") !== "false",
        maintenance: String(sData.maintenance_mode ?? "false") === "true",
        eta: sData.maintenance_eta || "",
        supportEmail: sData.support_email || "",
        platformName: sData.platform_name || "DNTRNG",
        logoUrl: sData.logo_url || "",
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
    
    const answeredCount = quiz.responses.filter(r => {
      const a = r.answer;
      if (a === null || a === undefined) return false;
      if (typeof a === 'string') return a.trim() !== '';
      if (Array.isArray(a)) return a.length > 0;
      if (typeof a === 'object') return Object.keys(a).length > 0;
      return false;
    }).length;

    // SPAM GUARD ENFORCEMENT
    if (answeredCount === 0) {
      const result = recordOffense();
      setSpamResult(result);
      
      if (result.status === 'warned') {
        toast({
          variant: "destructive",
          title: "Empty Submission / Bài nộp trống",
          description: "Please answer at least one question. Repeated empty submissions will result in a ban. / Vui lòng trả lời ít nhất một câu hỏi."
        });
      }
      
      trackEvent('quiz_spam_blocked', { test_id: testId as string });
      return;
    }

    const duration = Date.now() - (quizStartTimeRef.current || Date.now());
    setFinalDuration(duration);
    setIsSubmittingVisually(true);
    try {
      const res = await fetch('/api/proxy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testId, responses: quiz.responses, 
          userName: user?.displayName || guestName || 'Guest User', 
          userEmail: user?.email || 'Anonymous', 
          duration, mode: quiz.mode, 
          certificateId: `CRT-${testId}-${Date.now().toString().slice(-6)}`.toUpperCase(),
          flagged: antiCheatViolation.flagged,
          violationCount: antiCheatViolation.count,
          flagReason: antiCheatViolation.flagged ? 'tab_switch_x3' : ''
        })
      });
      const data = await res.json();
      if (res.ok) { setPendingSubmissionResult(data); setIsSubmissionDataReady(true); }
      else throw new Error(data.error);
    } catch (e: any) {
      setIsSubmittingVisually(false); toast({ variant: "destructive", title: "Submission Failure" });
    }
  };

  const handleStart = async (mode: QuizMode) => {
    if (isBanned()) { 
      setSpamResult(getSpamRecord()); 
      return; 
    }
    
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
    setIsStarted(true); 
    setQuiz(prev => ({ ...prev, questions: q, mode, currentQuestionIndex: 0, responses: [] }));
  };

  // BAN TERMINAL RENDER NODE
  if (spamResult && (spamResult.status === 'softban' || spamResult.status === 'banned') && isBanned()) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 animate-in zoom-in-95 duration-500">
           <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-8" />
           <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Suspended</h2>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Security Quarantine Protocol</p>
           <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 mb-10">
              <p className="text-[10px] font-black uppercase text-rose-500 mb-1">Unlocks at / Mở khóa lúc</p>
              <p className="text-xl font-black text-rose-700 tabular-nums">{new Date(spamResult.expiresAt!).toLocaleString()}</p>
           </div>
           <Button onClick={() => router.push('/tests')} className="w-full h-14 rounded-full bg-slate-900 text-white font-black uppercase text-xs">Back to Tests</Button>
         </div>
      </div>
    );
  }

  if (globalData?.maintenance) {
    return <MaintenanceView platformName={globalData.platformName} logoUrl={globalData.logoUrl} eta={globalData.eta} supportEmail={globalData.supportEmail} isAdmin={user?.role === 'admin'} onReturnHome={() => router.push('/')} />;
  }

  if (isInitialVisuallyLoading || isSyncingTraining || isSubmittingVisually) {
    return <QuizLoadingManager isSubmitting={isSubmittingVisually} isSubmissionDataReady={isSubmissionDataReady} onSubmissionComplete={finalizeSubmission} isInitialLoading={isInitialVisuallyLoading} isInitialDataReady={isInitialDataReady} onInitialComplete={() => setIsInitialVisuallyLoading(false)} isSyncingTraining={isSyncingTraining} />;
  }

  const currentTestMetadata = globalData?.tests.find(t => String(t.id) === String(testId));

  return (
    <>
      <AntiCheatModal isOpen={isCheatWarningOpen} violationCount={antiCheatViolation.count} isFlagged={antiCheatViolation.flagged} onAcknowledge={() => setIsCheatWarningOpen(false)} />
      
      <LeaveConfirmationModal 
        isOpen={isLeaveModalOpen} 
        onStay={() => setIsLeaveModalOpen(false)} 
        onLeave={() => router.push('/tests')} 
      />

      {!isStarted ? (
        <QuizStart title={currentTestMetadata?.title || 'Assessment'} questionsCount={questionsData?.length || 0} user={user} guestName={guestName} setGuestName={setGuestName} protocolSalt={globalData?.salt} isProtectionEnabled={globalData?.protection} guestAccessAllowed={globalData?.guest} onStart={handleStart} testId={testId || undefined} />
      ) : quiz.isSubmitted ? (
        <QuizResults title={currentTestMetadata?.title || 'Assessment'} testId={testId} score={quiz.score} totalQuestions={quiz.questions.length} questions={quiz.questions} responses={quiz.responses} serverReviewData={serverReviewData} userName={user?.displayName || guestName || 'Guest User'} onRestart={() => { setIsStarted(false); setQuiz(prev => ({...prev, isSubmitted: false, responses: []})); }} certificateId={generatedCertificateId || undefined} duration={finalDuration} allTests={globalData?.tests} testMetadata={currentTestMetadata} />
      ) : (
        <QuizActive quiz={quiz} quizTitle={currentTestMetadata?.title || 'Assessment'} timeLeft={timeLeft} isWrongInRace={isWrongInRace} onResponseChange={(val) => { const q = quiz.questions[quiz.currentQuestionIndex]; const updated = [...quiz.responses]; const idx = updated.findIndex(r => r.questionId === q.id); if (idx > -1) updated[idx].answer = val; else updated.push({ questionId: q.id, answer: val }); setQuiz({ ...quiz, responses: updated }); }} onConfirmResponse={() => { const q = quiz.questions[quiz.currentQuestionIndex]; const updated = [...quiz.responses]; const idx = updated.findIndex(r => r.questionId === q.id); if (idx > -1) { updated[idx].isConfirmed = true; setQuiz({ ...quiz, responses: updated }); } }} onNext={() => { if (quiz.currentQuestionIndex < quiz.questions.length - 1) setQuiz(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 })); }} onPrev={() => setQuiz({ ...quiz, currentQuestionIndex: Math.max(0, quiz.currentQuestionIndex - 1) })} onSubmit={submit} onJump={(idx) => setQuiz(prev => ({ ...prev, currentQuestionIndex: idx }))} onToggleFlag={(id) => { setQuiz(prev => ({ ...prev, flaggedQuestionIds: prev.flaggedQuestionIds?.includes(id) ? prev.flaggedQuestionIds.filter(f => f !== id) : [...(prev.flaggedQuestionIds || []), id] })); }} />
      )}
      
      <BugReportButton testId={testId || undefined} questionId={quiz.questions[quiz.currentQuestionIndex]?.id} questionIndex={quiz.currentQuestionIndex} quizMode={quiz.mode} totalQuestions={quiz.questions.length} />
    </>
  );
}

export default function QuizPage() {
  return <Suspense fallback={null}><QuizContent /></Suspense>;
}
