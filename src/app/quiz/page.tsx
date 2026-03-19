
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Question, UserResponse, QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Send, RotateCcw, CheckCircle2, XCircle, AlertCircle, Loader2, Home } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";

const DEMO_QUESTIONS: Question[] = [
  {
    id: "m1",
    question_text: "Match the programming languages to their primary use cases:",
    question_type: "matching",
    order_group: "TypeScript|Web Development,Python|Data Science,Swift|iOS Apps,SQL|Databases",
    correct_answer: "TypeScript|Web Development,Python|Data Science,Swift|iOS Apps,SQL|Databases",
    required: true
  },
  {
    id: "1",
    question_text: "What is the primary benefit of using QuestFlow?",
    question_type: "single_choice",
    options: "No coding required, High performance, Google Sheets integration, All of the above",
    correct_answer: "All of the above",
    required: true
  },
  {
    id: "2",
    question_text: "Which technologies power the QuestFlow frontend?",
    question_type: "multiple_choice",
    options: "Next.js, React, Tailwind CSS, Shadcn/UI, Vue.js",
    correct_answer: "Next.js, React, Tailwind CSS, Shadcn/UI",
    required: true
  },
  {
    id: "4",
    question_text: "Rank these steps to set up QuestFlow in the correct order:",
    question_type: "ordering",
    order_group: "Connect API URL, Create Google Sheet, Deploy Apps Script, Share Sheet",
    correct_answer: "Create Google Sheet, Share Sheet, Deploy Apps Script, Connect API URL",
    required: true
  },
  {
    id: "5",
    question_text: "Locate the peak of the mountain in this image.",
    question_type: "hotspot",
    image_url: "https://picsum.photos/seed/mountain1/800/450",
    metadata: JSON.stringify([{ id: 'peak', label: 'Mountain Peak', x: 50, y: 35, radius: 10 }]),
    required: false
  }
];

function QuizContent() {
  const searchParams = useSearchParams();
  const quizTitle = searchParams.get('title') || 'QuestFlow Assessment';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isSubmitted: false,
    score: 0,
    startTime: Date.now()
  });

  const { toast } = useToast();

  const API_URL = ""; 

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await fetch(API_URL);
        const data = await res.json();
        setQuiz(prev => ({ ...prev, questions: data, startTime: Date.now() }));
      } else {
        setQuiz(prev => ({ ...prev, questions: DEMO_QUESTIONS, startTime: Date.now() }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load questions. Make sure your API is configured correctly.");
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
          body: JSON.stringify({
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
    setQuiz({
      ...quiz,
      currentQuestionIndex: 0,
      responses: [],
      isSubmitted: false,
      score: 0,
      startTime: Date.now()
    });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl font-medium">Loading QuestFlow...</p>
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
        <header className="space-y-4 mb-4 text-center">
          <h1 className="text-4xl font-black text-foreground tracking-tight">{quizTitle}</h1>
          <div className="flex justify-between items-center text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
            <span>Progress: {quiz.currentQuestionIndex + 1} / {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-slate-100" />
        </header>

        <Card className="flex-1 shadow-2xl border-none overflow-hidden rounded-[2rem] bg-white">
          <div className="flex justify-between items-center px-6 md:px-12 py-8 border-b bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
            <Button 
              variant="outline" 
              onClick={prev} 
              disabled={quiz.currentQuestionIndex === 0}
              className="rounded-full px-6 h-12 bg-white border-2 font-bold hover:bg-slate-50"
            >
              <ChevronLeft className="w-5 h-5 mr-1.5" />
              Back
            </Button>
            
            <div className="flex gap-3">
              {quiz.currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button 
                  onClick={submit} 
                  className="rounded-full px-10 h-12 bg-primary hover:bg-primary/90 shadow-xl font-bold transition-all hover:scale-105"
                >
                  Submit Final Answers
                  <Send className="w-4 h-4 ml-2.5" />
                </Button>
              ) : (
                <Button 
                  onClick={next} 
                  className="rounded-full px-10 h-12 shadow-lg font-bold transition-all hover:scale-105"
                >
                  Next Question
                  <ChevronRight className="w-5 h-5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>

          <CardContent className="pt-12 px-6 md:px-20 pb-20">
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
