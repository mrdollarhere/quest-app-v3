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
import { AILoader } from '@/components/ui/ai-loader';
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isSyncingTraining, setIsSyncingTraining] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); 
  const [isWrongInRace, setIsWrongInRace] = useState(false);
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null);
  const [serverReviewData, setServerReviewData] = useState<any[]>([]);
  const [finalDuration, setFinalDuration] = useState<number>(0);

  // VISUAL MINIMUM ORCHESTRATION STATES
  const [isInitialVisuallyLoading, setIsInitialVisuallyLoading] = useState(true);
  const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);
  const [isSubmittingVisually, setIsSubmittingVisually] = useState(false);
  const [isSubmissionDataReady, setIsSubmissionDataReady] = useState(false);
  const [isSubmissionAnimationDone, setIsSubmissionAnimationDone] = useState(false);
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const quizStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('dntrng_guest_name');
    if (savedName) setGuestName(savedName);
  }, []);

  const { data: questionsData, isLoading: qLoading, error: qError } = useSWR(
    testId ? `/api/proxy/questions?id=${testId}` : null
  );

  const { data: globalData, isLoading: configLoading } = useSWR(
    '/api/proxy/settings',
    async (url) => {
      const [sRes, tRes] = await Promise.all([
        fetch('/api/proxy/settings'),
        fetch('/api/proxy/tests')
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();
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

  // INITIAL LOADING ORCHESTRATION
  useEffect(() => {
    const isDataLoaded = !qLoading && !configLoading;
    if (isDataLoaded && isInitialAnimationDone) {
      setIsInitialVisuallyLoading(false);
    }
  }, [qLoading, configLoading, isInitialAnimationDone]);

  // SUBMISSION ORCHESTRATION
  useEffect(() => {
    if (isSubmissionDataReady && isSubmissionAnimationDone && pendingSubmissionResult) {
      const data = pendingSubmissionResult;
      const passingThreshold = Number(testMetadata?.passing_threshold || globalData?.defaultThreshold || 70);
      const finalPercentage = Math.round((data.score / (data.total || 1)) * 100);
      const isPassed = finalPercentage >= passingThreshold;
      
      if (isPassed && testMetadata?.certificate_enabled !== 'FALSE') {
        setGeneratedCertificateId(data.certificateId);
      }

      setServerReviewData(data.reviewData || []);
      setQuiz(prev => ({ ...prev, isSubmitted: true, score: data.score, endTime: Date.now() }));
      
      if (user?.email) globalMutate(`results-${user.email}`);
      
      setIsSubmittingVisually(false);
      // Reset flags for next session
      setIsSubmissionDataReady(false);
      setIsSubmissionAnimationDone(false);
      setPendingSubmissionResult(null);
    }
  }, [isSubmissionDataReady, isSubmissionAnimationDone, pendingSubmissionResult]);

  useEffect(() => {
    if (isStarted && !quiz.isSubmitted) {
      timerRef.current = setInterval(() => {
        if (Number(globalData?.globalTimer || 0) > 0) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (quiz.mode === 'race') {
                submit();
                return 0;
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, quiz.isSubmitted, globalData, quiz.mode]);

  const testMetadata = globalData?.tests.find(t => String(t.id) === String(testId));

  const handleResponseChange = (val: any) => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const updatedResponses = [...quiz.responses];
    const index = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    
    if (index > -1) {
      updatedResponses[index].answer = val;
    } else {
      updatedResponses.push({ questionId: currentQuestion.id, answer: val });
    }
    setQuiz({ ...quiz, responses: updatedResponses });
  };

  const handleConfirmResponse = () => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const updatedResponses = [...quiz.responses];
    const index = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    if (index > -1) {
      updatedResponses[index].isConfirmed = true;
      setQuiz({ ...quiz, responses: updatedResponses });
    }
  };

  const handleNext = () => {
    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      const nextIdx = quiz.currentQuestionIndex + 1;
      setQuiz({ ...quiz, currentQuestionIndex: nextIdx, highestStepReached: Math.max(quiz.highestStepReached, nextIdx) });
    }
  };

  const submit = async () => {
    if (isSubmittingVisually) return;
    
    const now = Date.now();
    const duration = now - (quizStartTimeRef.current || now);
    setFinalDuration(duration);

    const finalName = user?.displayName || guestName || 'Guest User';
    const finalEmail = user?.email || 'Anonymous';

    setIsSubmittingVisually(true);
    setIsSubmissionDataReady(false);
    setIsSubmissionAnimationDone(false);
    
    try {
      const res = await fetch('/api/proxy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          responses: quiz.responses,
          userName: finalName,
          userEmail: finalEmail,
          duration: duration,
          mode: quiz.mode,
          certificateId: `CRT-${testId}-${now.toString().slice(-6)}`.toUpperCase()
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setPendingSubmissionResult(data);
        setIsSubmissionDataReady(true);
        
        trackEvent('quiz_submit', { 
          test_id: testId || '', 
          test_name: testMetadata?.title,
          score: data.score, 
          details: { passed: data.percentage >= 70, total: data.total, duration } 
        });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setIsSubmittingVisually(false);
      toast({ variant: "destructive", title: "Submission Failure", description: e.message || "The registry handshake failed." });
    }
  };

  const handleStart = async (mode: QuizMode) => {
    let q = questionsData || [];

    if (mode === 'training') {
      setIsSyncingTraining(true);
      try {
        const res = await fetch(`/api/proxy/questions?id=${testId}&training=true`);
        if (!res.ok) throw new Error();
        q = await res.json();
      } catch (e) {
        toast({ variant: "destructive", title: "Sync Error", description: "Could not retrieve answer key for practice." });
        setIsSyncingTraining(false);
        return;
      }
      setIsSyncingTraining(false);
    }

    if (!q || q.length === 0) {
      toast({ variant: "destructive", title: "Module Error", description: "This assessment contains no active questions." });
      return;
    }
    
    if (mode === 'test') q = [...q].sort(() => Math.random() - 0.5);
    
    const limit = Number(globalData?.globalTimer || 0);
    setTimeLeft(limit > 0 ? limit * 60 : 900);
    quizStartTimeRef.current = Date.now();
    
    setIsStarted(true);
    setQuiz(prev => ({ ...prev, questions: q, startTime: Date.now(), mode: mode, currentQuestionIndex: 0, responses: [] }));
    trackEvent('quiz_start', { test_id: testId || '', test_name: testMetadata?.title, details: { mode } });
  };

  if (globalData?.maintenance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900 uppercase">Maintenance Mode</h2>
        <p className="text-slate-500 mb-8">Platform registry is currently undergoing calibration.</p>
        <Button onClick={() => router.push('/')} className="rounded-full px-8">Return Home</Button>
      </div>
    );
  }

  if (qError || (questionsData && questionsData.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900">Module Empty</h2>
        <Button onClick={() => router.push('/tests')} className="rounded-full px-8">Return to Library</Button>
      </div>
    );
  }

  if (isInitialVisuallyLoading || isSyncingTraining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AILoader 
          showBrand={true} 
          onComplete={() => setIsInitialAnimationDone(true)}
        />
      </div>
    );
  }

  if (isSubmittingVisually) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <AILoader 
          showBrand={true} 
          onComplete={() => setIsSubmissionAnimationDone(true)}
        />
      </div>
    );
  }

  if (!isStarted) return <QuizStart title={testMetadata?.title || 'Assessment'} questionsCount={questionsData?.length || 0} duration={testMetadata?.duration} user={user} guestName={guestName} setGuestName={setGuestName} protocolSalt={globalData?.salt} isProtectionEnabled={globalData?.protection} guestAccessAllowed={globalData?.guest} onStart={handleStart} testId={testId || undefined} />;

  if (quiz.isSubmitted) return <QuizResults title={testMetadata?.title || 'Assessment'} testId={testId || undefined} score={quiz.score} totalQuestions={quiz.questions.length} questions={quiz.questions} responses={quiz.responses} serverReviewData={serverReviewData} userName={user?.displayName || guestName || 'Guest User'} onRestart={() => { setIsStarted(false); setQuiz(prev => ({...prev, isSubmitted: false, responses: []})); }} startTime={quiz.startTime} endTime={quiz.endTime} testMetadata={testMetadata} certificateId={generatedCertificateId || undefined} duration={finalDuration} />;

  return <QuizActive quiz={quiz} quizTitle={testMetadata?.title || 'Assessment'} timeLeft={timeLeft} isWrongInRace={isWrongInRace} onResponseChange={handleResponseChange} onConfirmResponse={handleConfirmResponse} onNext={handleNext} onPrev={() => setQuiz({ ...quiz, currentQuestionIndex: Math.max(0, quiz.currentQuestionIndex - 1) })} onSubmit={submit} onJump={(i) => setQuiz({ ...quiz, currentQuestionIndex: i })} onToggleFlag={(id) => { setQuiz(prev => ({ ...prev, flaggedQuestionIds: prev.flaggedQuestionIds?.includes(id) ? prev.flaggedQuestionIds.filter(f => f !== id) : [...(prev.flaggedQuestionIds || []), id] })); }} />;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><AILoader showBrand={true} /></div>}>
      <QuizContent />
    </Suspense>
  );
}
