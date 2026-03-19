
"use client";

import React, { useState, useEffect } from 'react';
import { Question, UserResponse, QuizState } from '@/types/quiz';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Send, RotateCcw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

const DEMO_QUESTIONS: Question[] = [
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
    id: "3",
    question_text: "Is Google Apps Script required for QuestFlow to work with live data?",
    question_type: "true_false",
    correct_answer: "True",
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
  },
  {
    id: "6",
    question_text: "Which programming language is used for Google Apps Script?",
    question_type: "dropdown",
    options: "Python, JavaScript, Ruby, PHP",
    correct_answer: "JavaScript",
    required: true
  },
  {
    id: "7",
    question_text: "What is the capital of the country where Google was founded?",
    question_type: "short_text",
    correct_answer: "Washington D.C.",
    required: true
  },
  {
    id: "8",
    question_text: "How would you rate your experience with this demo so far?",
    question_type: "rating",
    required: false
  }
];

export default function QuizPage() {
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
      if (!q.correct_answer || !response) return;

      if (q.question_type === 'single_choice' || q.question_type === 'true_false' || q.question_type === 'short_text' || q.question_type === 'dropdown') {
        if (response.toString().toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) score++;
      } else if (q.question_type === 'multiple_choice') {
        const resArr = (response as string[]).map(r => r.trim()).sort();
        const correctArr = q.correct_answer.split(',').map(c => c.trim()).sort();
        if (JSON.stringify(resArr) === JSON.stringify(correctArr)) score++;
      } else if (q.question_type === 'ordering') {
        const correctArr = q.correct_answer.split(',').map(c => c.trim());
        if (JSON.stringify(response) === JSON.stringify(correctArr)) score++;
      } else if (q.question_type === 'hotspot') {
        const zones = JSON.parse(q.metadata || "[]");
        const hit = zones.find((z: any) => {
          const dist = Math.sqrt(Math.pow(response.x - z.x, 2) + Math.pow(response.y - z.y, 2));
          return dist <= z.radius;
        });
        if (hit) score++;
      }
    });
    return score;
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
          <Card className="text-center py-8">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              {hasCorrectAnswers && (
                <div className="mb-6">
                  <p className="text-5xl font-bold text-primary">{quiz.score} / {quiz.questions.length}</p>
                  <p className="text-muted-foreground mt-2">Your Score</p>
                </div>
              )}
              <p className="text-lg">Thank you for participating. You can review your answers below.</p>
            </CardContent>
            <CardFooter className="justify-center gap-4">
              <Button onClick={restart} variant="outline" className="rounded-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Link href="/">
                <Button className="rounded-full">Back to Home</Button>
              </Link>
            </CardFooter>
          </Card>

          <h3 className="text-2xl font-bold mt-12 mb-6 px-2">Detailed Review</h3>
          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const userResp = quiz.responses.find(r => r.questionId === q.id)?.answer;
              return (
                <Card key={q.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {q.correct_answer ? (
                          calculateScoreForQuestion(q, userResp) ? 
                          <CheckCircle2 className="w-6 h-6 text-green-500" /> : 
                          <XCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded-full" />
                        )}
                      </div>
                      <QuestionRenderer 
                        question={q} 
                        value={userResp} 
                        onChange={() => {}} 
                        reviewMode={true} 
                      />
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

  function calculateScoreForQuestion(q: Question, response: any): boolean {
    if (!q.correct_answer || !response) return false;
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
    }
    return false;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl flex-1 flex flex-col gap-6">
        <header className="space-y-4 mb-4">
          <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            <span>Question {quiz.currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </header>

        <Card className="flex-1 shadow-xl border-none overflow-hidden">
          <div className="flex justify-between items-center px-6 md:px-10 py-6 border-b bg-slate-50/50">
            <Button 
              variant="outline" 
              onClick={prev} 
              disabled={quiz.currentQuestionIndex === 0}
              className="rounded-full px-6 bg-white"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            
            {quiz.currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                onClick={submit} 
                className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-sm"
              >
                Submit Answers
                <Send className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={next} 
                className="rounded-full px-8 shadow-sm"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>

          <CardContent className="pt-10 px-6 md:px-10">
            <QuestionRenderer 
              question={currentQuestion} 
              value={currentResponse} 
              onChange={handleResponseChange} 
            />
          </CardContent>
          <div className="pb-8" />
        </Card>
      </div>
    </div>
  );
}
