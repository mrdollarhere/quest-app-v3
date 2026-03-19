
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { QuizStart } from '@/components/quiz/QuizStart';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Loader2, 
  ListOrdered,
  Check,
  Timer
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import { DEMO_QUESTIONS, AVAILABLE_TESTS } from '@/app/lib/demo-data';
import { API_URL } from '@/lib/api-config';
import { useAuth } from '@/context/auth-context';
import { calculateTotalScore } from '@/lib/quiz-utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function QuizContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const { user } = useAuth();
  
  const testMetadata = useMemo(() => {
    return AVAILABLE_TESTS.find(t => t.id === testId);
  }, [testId]);

  const quizTitle = testMetadata?.title || 'QuestFlow Assessment';

  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isSubmitted: false,
    score: 0,
    startTime: Date.now()
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  // Timer logic
  useEffect(() => {
    if (quiz.isSubmitted || loading || !isStarted) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz.isSubmitted, loading, isStarted]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?action=getQuestions&id=${testId}`);
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setQuiz(prev => ({ ...prev, questions: data, startTime: Date.now() }));
        } else {
          setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
        }
      } else {
        setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
      }
    } catch (err) {
      setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const progress = quiz.questions.length > 0 ? ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const handleResponseChange = (val: any) => {
    const updatedResponses = [...quiz.responses];
    const index = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    if (index > -1) {
      updatedResponses[index].answer = val;
    } else {
      updatedResponses.push({ questionId: currentQuestion.id, answer: val });
    }
    setQuiz({ ...quiz, responses: updatedResponses });
  };

  const currentResponse = quiz.responses.find(r => r.questionId === currentQuestion?.id)?.answer;

  const isAnswered = (questionId: string) => {
    const resp = quiz.responses.find(r => r.questionId === questionId)?.answer;
    if (resp === undefined || resp === null) return false;
    if (typeof resp === 'string') return resp.trim().length > 0;
    if (Array.isArray(resp)) return resp.length > 0;
    if (typeof resp === 'object') return Object.keys(resp).length > 0;
    return true;
  };

  const next = () => {
    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      setQuiz({ ...quiz, currentQuestionIndex: quiz.currentQuestionIndex + 1 });
    }
  };

  const prev = () => {
    if (quiz.currentQuestionIndex > 0) {
      setQuiz({ ...quiz, currentQuestionIndex: quiz.currentQuestionIndex - 1 });
    }
  };

  const submit = async () => {
    const finalScore = calculateTotalScore(quiz.questions, quiz.responses);
    const finalName = user?.displayName || guestName?.trim() || 'Guest User';
    const finalEmail = user?.email || 'Anonymous';
    
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
            responses: quiz.responses
          })
        });
        toast({ title: "Results Synced", description: "Your performance has been logged." });
      } catch (e) {
        console.error("Submission failed", e);
      }
    }
  };

  const restart = () => {
    setTimeLeft(900);
    setQuiz({
      ...quiz,
      currentQuestionIndex: 0,
      responses: [],
      isSubmitted: false,
      score: 0,
      startTime: Date.now()
    });
  };

  const jumpToQuestion = (index: number) => {
    setQuiz(prev => ({ ...prev, currentQuestionIndex: index }));
    setIsSidebarOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!user && !guestName.trim()) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please enter your name to start the test." });
      return;
    }
    setIsStarted(true);
    setQuiz(prev => ({ ...prev, startTime: Date.now() }));
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl font-medium">Loading Assessment...</p>
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
        onStart={handleStart}
      />
    );
  }

  if (quiz.isSubmitted) {
    return (
      <QuizResults 
        title={quizTitle}
        score={quiz.score}
        totalQuestions={quiz.questions.length}
        questions={quiz.questions}
        responses={quiz.responses}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl flex-1 flex flex-col gap-6">
        <header className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <Link href="/tests">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" /> Exit
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight text-center flex-1 mx-4 line-clamp-1">{quizTitle}</h1>
            <div className="w-[80px]" /> 
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
              <span>Question {quiz.currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
          </div>
        </header>

        <Card className="flex-1 shadow-2xl border-none overflow-hidden rounded-[2rem] bg-white flex flex-col">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <div className="flex justify-between items-center px-4 md:px-8 py-6 border-b bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
              <Button 
                variant="outline" 
                onClick={prev} 
                disabled={quiz.currentQuestionIndex === 0}
                className="rounded-full px-4 md:px-6 h-12 bg-white border-2 font-bold shrink-0"
              >
                <ChevronLeft className="w-5 h-5 md:mr-1.5" />
                <span className="hidden md:inline">Back</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 shrink-0 hover:bg-primary/10">
                    <ListOrdered className="w-6 h-6 text-primary" />
                  </Button>
                </SheetTrigger>

                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full font-mono text-sm font-bold text-slate-700 shrink-0">
                  <Timer className={cn("w-4 h-4", timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary")} />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                {quiz.currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button 
                    onClick={submit} 
                    className="rounded-full px-6 md:px-10 h-12 bg-primary hover:bg-primary/90 shadow-xl font-bold transition-all hover:scale-105"
                  >
                    <span className="hidden md:inline">Submit</span>
                    <Send className="w-4 h-4 md:ml-2.5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={next} 
                    className="rounded-full px-6 md:px-10 h-12 shadow-lg font-bold transition-all hover:scale-105"
                  >
                    <span className="hidden md:inline">Next</span>
                    <ChevronRight className="w-5 h-5 md:ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold">Assessment Progress</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-3">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = quiz.currentQuestionIndex === idx;
                  const answered = isAnswered(q.id);
                  return (
                    <Button
                      key={q.id}
                      variant={isCurrent ? "default" : "outline"}
                      className={cn(
                        "h-12 w-full rounded-xl font-bold transition-all border-2 relative",
                        !isCurrent && answered && "bg-green-50 border-green-200 text-green-600",
                        isCurrent && "border-primary shadow-md",
                      )}
                      onClick={() => jumpToQuestion(idx)}
                    >
                      {idx + 1}
                      {answered && !isCurrent && (
                        <Check className="w-3 h-3 absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <CardContent className="pt-12 px-6 md:px-20 pb-20 flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <QuestionRenderer 
                question={currentQuestion} 
                value={currentResponse} 
                onChange={handleResponseChange} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-medium">Preparing Assessment...</p>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
