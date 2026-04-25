"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { QuizState, QuizMode, Question } from '@/types/quiz';
import { QuizStart } from '@/components/quiz/QuizStart';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizActive } from '@/components/quiz/QuizActive';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEMO_QUESTIONS, AVAILABLE_TESTS } from '@/app/lib/demo-data';
import { API_URL } from '@/lib/api-config';
import { useAuth } from '@/context/auth-context';
import { calculateTotalScore, calculateScoreForQuestion } from '@/lib/quiz-utils';
import { AILoader } from '@/components/ui/ai-loader';
import { AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';
import Link from 'next/link';

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [isStarted, setIsStarted] = useState(false);
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

  const { data: questionsData, isLoading: qLoading } = useSWR(
    testId ? `questions-${testId}` : null,
    async () => {
      if (!API_URL) return DEMO_QUESTIONS;
      const res = await fetch(`${API_URL}?action=getQuestions&id=${testId}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  );

  const { data: globalData, isLoading: configLoading } = useSWR(
    'quiz-config',
    async () => {
      if (!API_URL) return { tests: AVAILABLE_TESTS, salt: "", protection: true, guest: true, maintenance: false };
      const [sRes, tRes] = await Promise.all([fetch(`${API_URL}?action=getSettings`), fetch(`${API_URL}?action=getTests`)]);
      const sData = await sRes.json();
      const tData = await tRes.json();
      return {
        tests: Array.isArray(tData) ? tData : [],
        salt: sData.daily_key_salt || "",
        protection: String(sData.access_key_protection_enabled ?? "true") !== "false",
        guest: String(sData.guest_access_allowed ?? "true") !== "false",
        maintenance: String(sData.maintenance_mode ?? "false") === "true",
        globalTimer: sData.global_timer_limit || "15"
      };
    }
  );

  const testMetadata = globalData?.tests.find(t => String(t.id) === String(testId));

  const handleResponseChange = (val: any) => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const updatedResponses = [...quiz.responses];
    const index = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    const isCorrect = calculateScoreForQuestion(currentQuestion, val);
    
    const prevAnswer = index > -1 ? updatedResponses[index].answer : undefined;
    if (index > -1) {
      updatedResponses[index].answer = val;
      updatedResponses[index].isCorrect = isCorrect;
      if (val !== prevAnswer) trackEvent('quiz_answer_change', { test_id: testId || '', question_id: currentQuestion.id });
    } else {
      updatedResponses.push({ questionId: currentQuestion.id, answer: val, isCorrect });
      trackEvent('quiz_answer', { test_id: testId || '', question_id: currentQuestion.id });
    }
    setQuiz({ ...quiz, responses: updatedResponses });
  };

  const handleNext = () => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    if (quiz.mode === 'race') {
      const resp = quiz.responses.find(r => r.questionId === currentQuestion.id);
      if (!resp || !resp.isCorrect) {
        setIsWrongInRace(true);
        trackEvent('quiz_reset', { test_id: testId || '', details: 'Race Streak Failed' });
        setTimeout(() => {
          setQuiz(prev => ({ ...prev, currentQuestionIndex: 0, responses: [], flaggedQuestionIds: [] }));
          setIsWrongInRace(false);
        }, 1500);
        return;
      }
    }

    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      const nextIdx = quiz.currentQuestionIndex + 1;
      setQuiz({ ...quiz, currentQuestionIndex: nextIdx, highestStepReached: Math.max(quiz.highestStepReached, nextIdx) });
      trackEvent('quiz_question_view', { test_id: testId || '', question_id: quiz.questions[nextIdx]?.id });
    }
  };

  const submit = async () => {
    const finalScore = calculateTotalScore(quiz.questions, quiz.responses);
    const finalName = user?.displayName || guestName || 'Guest User';
    const finalEmail = user?.email || 'Anonymous';
    const timestamp = Date.now();
    const finalPercentage = Math.round((finalScore / (quiz.questions.length || 1)) * 100);
    
    let certId = "";
    if (finalPercentage >= 70) {
      certId = `CRT-${finalEmail.slice(0,4)}-${testId}-${timestamp.toString().slice(-4)}`.toUpperCase();
      setGeneratedCertificateId(certId);
    }
    
    trackEvent('quiz_submit', { test_id: testId || '', score: finalScore, details: { total: quiz.questions.length, mode: quiz.mode } });
    if (testId) sessionStorage.removeItem(`quiz_session_${testId}`);
    setQuiz({ ...quiz, isSubmitted: true, score: finalScore, endTime: timestamp });
    if (user?.email) globalMutate(`results-${user.email}`);

    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'submitResponse',
            testId: testId || 'Unknown',
            userName: finalName,
            userEmail: finalEmail,
            score: finalScore,
            total: quiz.questions.length,
            duration: timestamp - quiz.startTime,
            responses: quiz.responses,
            mode: quiz.mode,
            certificateId: certId
          })
        });
      } catch (e) {}
    }
  };

  const handleStart = (mode: QuizMode) => {
    setIsStarted(true);
    trackEvent('quiz_start', { test_id: testId || '', details: mode });
    let q = [...(questionsData || [])];
    if (mode === 'test') q = q.sort(() => Math.random() - 0.5);
    setQuiz(prev => ({ ...prev, questions: q, startTime: Date.now(), mode: mode }));
    trackEvent('quiz_question_view', { test_id: testId || '', question_id: q[0]?.id });
  };

  if (qLoading || configLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><AILoader /></div>;

  if (!isStarted) {
    return (
      <QuizStart 
        title={testMetadata?.title || 'Assessment'}
        description={testMetadata?.description}
        questionsCount={quiz.questions.length}
        duration={testMetadata?.duration}
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
        protocolSalt={globalData?.salt}
        isProtectionEnabled={globalData?.protection}
        guestAccessAllowed={globalData?.guest}
        onStart={handleStart}
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
        onRestart={() => { trackEvent('quiz_reset'); setIsStarted(false); setQuiz(prev => ({...prev, isSubmitted: false, responses: []})); }}
        startTime={quiz.startTime}
        endTime={quiz.endTime}
        testMetadata={testMetadata}
        allTests={globalData?.tests}
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
      onToggleFlag={(id) => { onToggleFlag(id); trackEvent('quiz_flag', { test_id: testId || '', question_id: id }); }}
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
