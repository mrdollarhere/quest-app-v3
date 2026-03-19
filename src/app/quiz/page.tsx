
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Question, UserResponse, QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Home,
  ListOrdered,
  Check,
  Timer
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import { DEMO_QUESTIONS, AVAILABLE_TESTS } from '@/app/lib/demo-data';
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
  
  const testMetadata = useMemo(() => {
    return AVAILABLE_TESTS.find(t => t.id === testId);
  }, [testId]);

  const quizTitle = testMetadata?.title || 'QuestFlow Assessment';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isSubmitted: false,
    score: 0,
    startTime: Date.now()
  });

  const { toast } = useToast();

  const API_URL = "https://script.google.com/macros/s/AKfycbxD0P_i2bmNpGH3QPJEsq7cGRac-EFtzo25glrQ10GPoARAyg_Vf4DmAqe0WBf6hw1VjQ/exec"; 

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  // Timer logic
  useEffect(() => {
    if (quiz.isSubmitted || loading) return;
    
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
  }, [quiz.isSubmitted, loading]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?id=${testId}`);
        const data = await res.json();
        // If API returns no data for this ID, we can fallback to demo for testing
        if (data && Array.isArray(data) && data.length > 0) {
          setQuiz(prev => ({ ...prev, questions: data, startTime: Date.now() }));
        } else {
          console.warn("API returned no questions for this ID, falling back to demo data.");
          setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
        }
      } else {
        setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load questions. Check your API configuration and ensure your script allows CORS.");
      // Even on error, we might want to allow demo data for easier testing of the UI
      setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
      setError(null);
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

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach(q => {
      const response = quiz.responses.find(r => r.questionId === q.id)?.answer;
      if (calculateScoreForQuestion(q, response)) score++;
    });
    return score;
  };

  const calculateScoreForQuestion = (q: Question, response: any): boolean => {
    if (!q.correct_answer || response === undefined || response === null) return false;
    
    if (q.question_type === 'single_choice' || q.question_type === 'true_false' || q.question_type === 'short_text' || q.question_type === 'dropdown') {
      return response.toString().toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
    } else if (q.question_type === 'multiple_choice') {
      const resArr = (response as string[]).map(r => r.trim()).sort();
      const correctArr = q.correct_answer.split(',').map(c => c.trim()).sort();
      return JSON.stringify(resArr) === JSON.stringify(correctArr);
    } else if (q.question_type === 'ordering') {
      const correctArr = q.correct_answer.split(',').map(c => c.trim());
      return JSON.stringify(response) === JSON.stringify(correctArr);
    } else if (q.question_type === 'hotspot') {
      const zones = JSON.parse(q.metadata || "[]");
      const hit = zones.find((z: any) => {
        const dist = Math.sqrt(Math.pow(response.x - z.x, 2) + Math.pow(response.y - z.y, 2));
        return dist <= z.radius;
      });
      return !!hit;
    } else if (q.question_type === 'matching') {
      const correctPairs = q.correct_answer.split(',').map(p => p.trim());
      const userPairs = Object.entries(response as Record<string, string>).map(([k, v]) => `${k}|${v}`);
      if (correctPairs.length !== userPairs.length) return false;
      return correctPairs.every(cp => userPairs.includes(cp));
    }
    return false;
  };

  const submit = async () => {
    const finalScore = calculateScore();
    setQuiz({ ...quiz, isSubmitted: true, score: finalScore, endTime: Date.now() });

    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps Script requires no-cors for direct POST or careful header handling
          body: JSON.stringify({
            testId,
            responses: quiz.responses,
            score: finalScore,
            total: quiz.questions.length,
            duration: Date.now() - quiz.startTime
          })
        });
      } catch (e) {
        console.error("Submission to sheet failed", e);
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl font-medium">Loading Assessment...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <p className="text-xl font-medium mb-4">{error}</p>
      <Link href="/setup-guide">
        <Button>Check Setup Guide</Button>
      </Link>
    </div>
  );

  if (quiz.isSubmitted) {
    const hasCorrectAnswers = quiz.questions.some(q => q.correct_answer);
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="text-center py-8 shadow-2xl border-none">
            <CardHeader>
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </div>
              <CardTitle className="text-4xl font-extrabold tracking-tight">Quiz Complete!</CardTitle>
              <p className="text-2xl font-bold text-primary mt-2">{quizTitle}</p>
            </CardHeader>
            <CardContent>
              {hasCorrectAnswers && (
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border">
                  <p className="text-6xl font-black text-primary">{quiz.score} <span className="text-3xl text-muted-foreground font-normal">/ {quiz.questions.length}</span></p>
                  <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs mt-3">Final Score</p>
                </div>
              )}
              <p className="text-lg text-muted-foreground">Great job finishing the assessment. You can review your detailed results below.</p>
            </CardContent>
            <CardFooter className="justify-center gap-4 pt-4">
              <Button onClick={restart} variant="outline" className="rounded-full px-8 h-12 font-bold">
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>
              <Link href="/">
                <Button className="rounded-full px-8 h-12 font-bold shadow-lg">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <div className="pt-12 pb-6">
            <h3 className="text-3xl font-black tracking-tight mb-2">Detailed Review</h3>
            <p className="text-muted-foreground">Analyze your performance question by question.</p>
          </div>
          
          <div className="space-y-6 pb-20">
            {quiz.questions.map((q, idx) => {
              const userResp = quiz.responses.find(r => r.questionId === q.id)?.answer;
              const isCorrect = calculateScoreForQuestion(q, userResp);
              return (
                <Card key={q.id} className={cn("border-l-8 overflow-hidden", isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                  <CardContent className="pt-8 px-6 md:px-10">
                    <div className="flex items-start gap-6">
                      <div className="shrink-0 mt-1">
                        {q.correct_answer ? (
                          isCorrect ? 
                          <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 className="w-6 h-6 text-green-600" /></div> : 
                          <div className="bg-red-100 p-2 rounded-full"><XCircle className="w-6 h-6 text-red-600" /></div>
                        ) : (
                          <div className="bg-slate-100 p-2 rounded-full"><AlertCircle className="w-6 h-6 text-slate-400" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <QuestionRenderer 
                          question={q} 
                          value={userResp} 
                          onChange={() => {}} 
                          reviewMode={true} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl flex-1 flex flex-col gap-6">
        <header className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <Link href="/tests">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight text-center flex-1 mx-4">{quizTitle}</h1>
            <div className="w-[80px]" /> {/* Spacer for balance */}
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
                className="rounded-full px-4 md:px-6 h-12 bg-white border-2 font-bold hover:bg-slate-50 shrink-0"
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
                <SheetTitle className="text-2xl font-bold">Quiz Progress</SheetTitle>
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
