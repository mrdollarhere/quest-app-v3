
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { QuizState, QuizMode, Question } from '@/types/quiz';
import { QuizStart } from '@/components/quiz/QuizStart';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizActive } from '@/components/quiz/QuizActive';
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { DEMO_QUESTIONS, AVAILABLE_TESTS } from '@/app/lib/demo-data';
import { API_URL } from '@/lib/api-config';
import { useAuth } from '@/context/auth-context';
import { calculateTotalScore, calculateScoreForQuestion } from '@/lib/quiz-utils';

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const testMetadata = useMemo(() => {
    return AVAILABLE_TESTS.find(t => t.id === testId);
  }, [testId]);

  const quizTitle = testMetadata?.title || 'DNTRNG Assessment';

  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [isWrongInRace, setIsWrongInRace] = useState(false);
  const [protocolSalt, setProtocolSalt] = useState("");
  
  // Master registry to keep the original order for Training/Race
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  
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
    fetchQuestions();
  }, [testId]);

  useEffect(() => {
    if (quiz.isSubmitted || loading || !isStarted || quiz.mode === 'training') return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz.isSubmitted, loading, isStarted, quiz.mode]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let fetched: Question[] = [];
      let salt = "";
      
      if (API_URL) {
        const [qRes, sRes] = await Promise.all([
          fetch(`${API_URL}?action=getQuestions&id=${testId}`),
          fetch(`${API_URL}?action=getSettings`)
        ]);
        
        const qData = await qRes.json();
        const sData = await sRes.json();
        
        if (qData && Array.isArray(qData) && qData.length > 0) {
          fetched = qData;
        } else {
          fetched = DEMO_QUESTIONS;
        }
        
        salt = sData.daily_key_salt || "";
      } else {
        fetched = DEMO_QUESTIONS;
      }
      
      setProtocolSalt(salt);
      setOriginalQuestions(fetched);
      setQuiz(prev => ({ ...prev, questions: fetched, startTime: Date.now() }));
    } catch (err) {
      setOriginalQuestions(DEMO_QUESTIONS);
      setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (val: any) => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const updatedResponses = [...quiz.responses];
    const index = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    const isCorrect = calculateScoreForQuestion(currentQuestion, val);
    
    if (index > -1) {
      updatedResponses[index].answer = val;
      updatedResponses[index].isCorrect = isCorrect;
    } else {
      updatedResponses.push({ questionId: currentQuestion.id, answer: val, isCorrect });
    }
    setQuiz({ ...quiz, responses: updatedResponses });
  };

  const handleNext = () => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    if (quiz.mode === 'race') {
      const resp = quiz.responses.find(r => r.questionId === currentQuestion.id);
      if (!resp || !resp.isCorrect) {
        setIsWrongInRace(true);
        toast({ 
          variant: "destructive", 
          title: "Protocol Violation", 
          description: "Incorrect response. Sequence terminated. Resetting to Step 1." 
        });
        setTimeout(() => {
          setQuiz(prev => ({ 
            ...prev, 
            currentQuestionIndex: 0, 
            responses: [],
            flaggedQuestionIds: [],
            highestStepReached: Math.max(prev.highestStepReached, prev.currentQuestionIndex + 1)
          }));
          setIsWrongInRace(false);
        }, 1500);
        return;
      }
    }

    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      setQuiz({ 
        ...quiz, 
        currentQuestionIndex: quiz.currentQuestionIndex + 1,
        highestStepReached: Math.max(quiz.highestStepReached, quiz.currentQuestionIndex + 1)
      });
    }
  };

  const handlePrev = () => {
    if (quiz.mode === 'race') return;
    if (quiz.currentQuestionIndex > 0) {
      setQuiz({ ...quiz, currentQuestionIndex: quiz.currentQuestionIndex - 1 });
    }
  };

  const handleToggleFlag = (id: string) => {
    setQuiz(prev => {
      const current = prev.flaggedQuestionIds || [];
      const updated = current.includes(id) 
        ? current.filter(fid => fid !== id) 
        : [...current, id];
      return { ...prev, flaggedQuestionIds: updated };
    });
  };

  const submit = async () => {
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    if (quiz.mode === 'race') {
      const resp = quiz.responses.find(r => r.questionId === currentQuestion.id);
      if (!resp || !resp.isCorrect) {
        setIsWrongInRace(true);
        setTimeout(() => {
          setQuiz(prev => ({ ...prev, currentQuestionIndex: 0, responses: [], flaggedQuestionIds: [] }));
          setIsWrongInRace(false);
        }, 1500);
        return;
      }
    }

    const finalScore = calculateTotalScore(quiz.questions, quiz.responses);
    const finalName = (user?.displayName || guestName?.trim() || 'Guest User');
    const finalEmail = (user?.email || 'Anonymous');
    
    setQuiz({ ...quiz, isSubmitted: true, score: finalScore, endTime: Date.now() });

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
            duration: Date.now() - quiz.startTime,
            responses: quiz.responses,
            mode: quiz.mode
          })
        });
        toast({ title: "Intelligence Synced", description: "Assessment results have been committed." });
      } catch (e) {
        console.error("Submission failed", e);
      }
    }
  };

  const shuffleQuestions = (arr: Question[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const restart = () => {
    setTimeLeft(900);
    let q = [...originalQuestions];
    if (quiz.mode === 'test') {
      q = shuffleQuestions(q);
    }
    setQuiz({
      ...quiz,
      currentQuestionIndex: 0,
      responses: [],
      isSubmitted: false,
      score: 0,
      startTime: Date.now(),
      mode: quiz.mode,
      highestStepReached: 0,
      questions: q,
      flaggedQuestionIds: []
    });
  };

  const jumpToQuestion = (index: number) => {
    if (quiz.mode === 'race') return;
    setQuiz(prev => ({ ...prev, currentQuestionIndex: index }));
  };

  const handleStart = (mode: QuizMode) => {
    setIsStarted(true);
    let q = [...originalQuestions];
    if (mode === 'test') {
      q = shuffleQuestions(q);
    }
    setQuiz(prev => ({ 
      ...prev, 
      questions: q, 
      startTime: Date.now(),
      mode: mode,
      flaggedQuestionIds: []
    }));
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
      <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Initializing DNTRNG Intelligence...</p>
    </div>
  );

  if (!isStarted) {
    return (
      <QuizStart 
        title={quizTitle}
        description={testMetadata?.description}
        questionsCount={quiz.questions.length}
        duration={testMetadata?.duration}
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
        protocolSalt={protocolSalt}
        onStart={handleStart}
      />
    );
  }

  if (quiz.isSubmitted) {
    return (
      <QuizResults 
        title={quizTitle}
        testId={testId || undefined}
        score={quiz.score}
        totalQuestions={quiz.questions.length}
        questions={quiz.questions}
        responses={quiz.responses}
        userName={user?.displayName || guestName || 'Guest User'}
        onRestart={restart}
        startTime={quiz.startTime}
        endTime={quiz.endTime}
      />
    );
  }

  return (
    <QuizActive 
      quiz={quiz}
      quizTitle={quizTitle}
      timeLeft={timeLeft}
      isWrongInRace={isWrongInRace}
      onResponseChange={handleResponseChange}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={submit}
      onJump={jumpToQuestion}
      onToggleFlag={handleToggleFlag}
    />
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Intelligence Modules...</p>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
