"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, AlertCircle, WifiOff } from "lucide-react";
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
  const [isConfigError, setIsConfigError] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // GROUNDING RULE: Show only for incorrect responses
  // CONFIG GUARD: Hide entirely if AI features are disabled
  if (isCorrect || isConfigError) return null;

  const isLimitReached = usageCount >= limit;

  const handleExplain = async () => {
    if (loading || explanation || isLimitReached || isRateLimited) return;

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
        // TACTICAL ERROR REGISTRY
        if (res.status === 503) {
          setIsConfigError(true);
          setError("AI features not available. Tính năng AI chưa được cấu hình.");
        } else if (res.status === 429) {
          setIsRateLimited(true);
          setError("Too many requests. Please wait a moment. Quá nhiều yêu cầu. Vui lòng đợi một lúc.");
          setTimeout(() => setIsRateLimited(false), 30000); // 30s cooldown
        } else if (res.status === 408) {
          setError("Request timed out. Please try again. Yêu cầu hết thời gian. Vui lòng thử lại.");
        } else {
          setError("Could not generate explanation. Please try again. Không thể tạo giải thích. Vui lòng thử lại.");
        }
        throw new Error(data.error || 'Failed to generate explanation');
      }
    } catch (e: any) {
      console.error('[AI Explanation Client Error]', e);
      // OFFLINE GUARD
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        setError("No internet connection. Không có kết nối mạng.");
      }
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
          disabled={isLimitReached || isRateLimited}
          className={cn(
            "h-8 px-4 rounded-full font-black uppercase text-[9px] tracking-widest gap-2 transition-all",
            (isLimitReached || isRateLimited)
              ? "border-slate-100 text-slate-300 opacity-50 cursor-not-allowed" 
              : "border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
          )}
        >
          <Sparkles className="w-3 h-3" />
          {isLimitReached ? "Limit reached (3/3) / Hết lượt (3/3)" : 
           isRateLimited ? "Wait 30s / Vui lòng chờ" : "Explain / Giải thích"}
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Thinking... / Đang phân tích...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-[9px] font-bold text-rose-500 flex items-center gap-2 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in shake-in">
          {error.includes("internet") ? <WifiOff className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {error}
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
