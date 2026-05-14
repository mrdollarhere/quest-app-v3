"use client";

import React, { useState, useEffect, Suspense } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); 
  const [isWrongInRace, setIsWrongInRace] = useState(false);
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null);
  
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

  useEffect(() => {
    const savedName = localStorage.getItem('dntrng_guest_name');
    if (savedName) setGuestName(savedName);
  }, []);

  // Registry Protocol: Hydrate Questions via Secure Proxy
  const { data: questionsData, isLoading: qLoading, error: qError, mutate: mutateQuestions } = useSWR(
    testId ? `/api/proxy/questions?id=${testId}` : null
  );

  // Registry Protocol: Hydrate Metadata via Secure Proxy
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

  const handleNext = () => {
    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      const nextIdx = quiz.currentQuestionIndex + 1;
      setQuiz({ ...quiz, currentQuestionIndex: nextIdx, highestStepReached: Math.max(quiz.highestStepReached, nextIdx) });
    }
  };

  const submit = async () => {
    if (isSubmitting) return;
    
    const finalName = user?.displayName || guestName || 'Guest User';
    const finalEmail = user?.email || 'Anonymous';
    const timestamp = Date.now();
    
    const passingThreshold = Number(testMetadata?.passing_threshold || globalData?.defaultThreshold || 70);

    setIsSubmitting(true);
    
    // SECURITY PROTOCOL: All calculations performed via Server-Side Proxy
    try {
      const res = await fetch('/api/proxy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          responses: quiz.responses,
          userName: finalName,
          userEmail: finalEmail,
          duration: timestamp - quiz.startTime,
          mode: quiz.mode,
          certificateId: `CRT-${testId}-${timestamp.toString().slice(-6)}`.toUpperCase()
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        const finalPercentage = Math.round((data.score / (data.total || 1)) * 100);
        const isPassed = finalPercentage >= passingThreshold;
        
        if (isPassed && testMetadata?.certificate_enabled !== 'FALSE') {
          setGeneratedCertificateId(data.certificateId);
        }

        setQuiz({ ...quiz, isSubmitted: true, score: data.score, endTime: timestamp });
        if (user?.email) globalMutate(`results-${user.email}`);
        
        trackEvent('quiz_submit', { 
          test_id: testId || '', 
          test_name: testMetadata?.title,
          score: data.score, 
          details: { passed: isPassed, total: data.total } 
        });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Submission Failure", 
        description: e.message || "The registry handshake failed." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = async (mode: QuizMode) => {
    let q = questionsData || [];

    // TRAINING PROTOCOL: If in training mode, we need questions with answers for immediate feedback.
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
    
    setIsStarted(true);
    setQuiz(prev => ({ 
      ...prev, 
      questions: q, 
      startTime: Date.now(), 
      mode: mode,
      currentQuestionIndex: 0,
      responses: []
    }));
    trackEvent('quiz_start', { test_id: testId || '', test_name: testMetadata?.title, details: { mode } });
  };

  if (globalData?.maintenance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-amber-500/10">
          <AlertCircle className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-4">Maintenance Mode</h2>
        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-10">
          The assessment protocol is currently offline for calibration. Access to all intelligence modules has been restricted for safety.
        </p>
        <Button onClick={() => router.push('/')} className="h-14 rounded-full px-10 bg-slate-900 font-black uppercase text-xs tracking-widest border-none shadow-xl">
          <Home className="w-4 h-4 mr-2" /> Return to Base
        </Button>
      </div>
    );
  }

  if (qError || (questionsData && questionsData.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Module Empty</h2>
        <p className="text-slate-500 mt-2 mb-8">This assessment module does not contain any active intelligence nodes.</p>
        <Button onClick={() => router.push('/tests')} className="rounded-full px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Library
        </Button>
      </div>
    );
  }

  if (qLoading || configLoading || isSyncingTraining) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><AILoader messages={isSyncingTraining ? ["Syncing Answer Key...", "Preparing Practice Environment..."] : undefined} /></div>;

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-in fade-in duration-500">
        <AILoader 
          messages={[
            "Submitting assessment...", 
            "Calculating your score", 
            "Synchronizing registry...",
            "Preparing your results"
          ]} 
        />
      </div>
    );
  }

  if (!isStarted) {
    return (
      <QuizStart 
        title={testMetadata?.title || 'Assessment'}
        questionsCount={questionsData?.length || 0}
        duration={testMetadata?.duration}
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
        protocolSalt={globalData?.salt}
        isProtectionEnabled={globalData?.protection}
        guestAccessAllowed={globalData?.guest}
        onStart={handleStart}
        testId={testId || undefined}
      />
    );
  }

  if (quiz.isSubmitted) {
    return (
      <QuizResults 
        title={testMetadata?.title || 'Assessment'}
        testId={testId || undefined}
        score={quiz.score}
        totalQuestions={quiz.questions.length}
        questions={quiz.questions}
        responses={quiz.responses}
        userName={user?.displayName || guestName || 'Guest User'}
        onRestart={() => { 
          setIsStarted(false); 
          setQuiz(prev => ({...prev, isSubmitted: false, responses: []})); 
        }}
        startTime={quiz.startTime}
        endTime={quiz.endTime}
        testMetadata={testMetadata}
        certificateId={generatedCertificateId || undefined}
      />
    );
  }

  return (
    <QuizActive 
      quiz={quiz}
      quizTitle={testMetadata?.title || 'Assessment'}
      timeLeft={timeLeft}
      isWrongInRace={isWrongInRace}
      onResponseChange={handleResponseChange}
      onNext={handleNext}
      onPrev={() => setQuiz({ ...quiz, currentQuestionIndex: Math.max(0, quiz.currentQuestionIndex - 1) })}
      onSubmit={submit}
      onJump={(i) => setQuiz({ ...quiz, currentQuestionIndex: i })}
      onToggleFlag={(id) => { 
        setQuiz(prev => ({ 
          ...prev, 
          flaggedQuestionIds: prev.flaggedQuestionIds?.includes(id) 
            ? prev.flaggedQuestionIds.filter(f => f !== id) 
            : [...(prev.flaggedQuestionIds || []), id] 
        }));
      }}
    />
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><AILoader /></div>}>
      <QuizContent />
    </Suspense>
  );
}