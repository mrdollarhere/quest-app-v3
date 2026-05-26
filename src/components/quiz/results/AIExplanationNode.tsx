"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIExplanationNodeProps {
  questionId: string;
  questionText: string;
  questionType: string;
  correctAnswer: any;
  studentAnswer: any;
  isCorrect: boolean;
  usageCount: number;
  limit: number;
  onSuccess: () => void;
}

export function AIExplanationNode({ 
  questionId, 
  questionText, 
  questionType, 
  correctAnswer, 
  studentAnswer, 
  isCorrect,
  usageCount,
  limit,
  onSuccess
}: AIExplanationNodeProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GROUNDING RULE: Show only for incorrect responses
  if (isCorrect) return null;

  const isLimitReached = usageCount >= limit;

  const handleExplain = async () => {
    if (loading || explanation || isLimitReached) return;

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
        onSuccess();
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
      {!explanation && !loading && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExplain}
          disabled={isLimitReached}
          className={cn(
            "h-8 px-4 rounded-full font-black uppercase text-[9px] tracking-widest gap-2 transition-all",
            isLimitReached 
              ? "border-slate-100 text-slate-300 opacity-50 cursor-not-allowed" 
              : "border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
          )}
        >
          <Sparkles className="w-3 h-3" />
          {isLimitReached ? "Limit reached (3/3) / Hết lượt (3/3)" : "Explain / Giải thích"}
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Thinking... / Đang phân tích...</span>
        </div>
      )}

      {error && (
        <div className="text-[9px] font-bold text-rose-500 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}

      {explanation && (
        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl relative overflow-hidden group animate-in zoom-in-95 duration-500">
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
