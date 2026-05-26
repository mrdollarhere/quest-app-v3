"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIExplanationNodeProps {
  questionId: string;
  questionText: string;
  questionType: string;
  correctAnswer: any;
  studentAnswer: any;
  isCorrect: boolean;
}

const MAX_EXPLANATIONS_PER_SESSION = 10;
const STORAGE_KEY = 'dntrng_ai_exp_count';

export function AIExplanationNode({ 
  questionId, 
  questionText, 
  questionType, 
  correctAnswer, 
  studentAnswer, 
  isCorrect 
}: AIExplanationNodeProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  // Skip rendering for correct responses
  if (isCorrect) return null;

  const handleExplain = async () => {
    if (loading || explanation) return;

    // 1. Quota Check
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    if (currentCount >= MAX_EXPLANATIONS_PER_SESSION) {
      setLimitReached(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/explain-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          questionType,
          correctAnswer,
          studentAnswer
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setExplanation(data.explanation);
        // Increment global session counter
        localStorage.setItem(STORAGE_KEY, (currentCount + 1).toString());
      } else {
        throw new Error(data.error || 'Failed to generate explanation');
      }
    } catch (e: any) {
      setError(e.message || 'Registry handshake failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      {!explanation && !loading && !limitReached && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExplain}
          className="h-8 px-4 rounded-full border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[9px] tracking-widest gap-2"
        >
          <Sparkles className="w-3 h-3" /> Explain / Giải thích
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Thinking... / Đang phân tích...</span>
        </div>
      )}

      {limitReached && (
        <div className="flex items-center gap-2 text-amber-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
          <AlertCircle className="w-3.5 h-3.5" />
          <p className="text-[9px] font-black uppercase tracking-tight">
            Session Limit Reached / Hết lượt giải thích cho phiên này.
          </p>
        </div>
      )}

      {error && (
        <div className="text-[9px] font-bold text-rose-500 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}

      {explanation && (
        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lightbulb className="w-12 h-12 text-blue-500" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">AI Insight / Phân tích từ AI</span>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed italic pr-8">
              "{explanation}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
