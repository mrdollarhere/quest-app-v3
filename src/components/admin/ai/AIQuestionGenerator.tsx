"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

// CEP Sub-components
import { AIInputScreen } from './AIInputScreen';
import { AIReviewScreen } from './AIReviewScreen';

interface AIQuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  onComplete: () => void;
}

export function AIQuestionGenerator({ open, onOpenChange, testId, onComplete }: AIQuestionGeneratorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'input' | 'loading' | 'review' | 'saving'>('input');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  const handleGenerate = async (config: any) => {
    setStep('loading');
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, testId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setGeneratedQuestions(data.questions.map((q: any, i: number) => ({
        ...q,
        tempId: `ai_gen_${i}`,
        selected: true
      })));
      setStep('review');
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e.message });
      setStep('input');
    }
  };

  const handleSaveSelected = async (questionsToSave: any[]) => {
    setStep('saving');
    setSaveProgress({ current: 0, total: questionsToSave.length });
    
    try {
      for (let i = 0; i < questionsToSave.length; i++) {
        const q = questionsToSave[i];
        const payload = {
          id: `ai_${Date.now()}_${i}`,
          question_text: q.question_text,
          question_type: q.question_type,
          options: JSON.stringify(q.options || []),
          correct_answer: JSON.stringify(q.correct_answer || []),
          order_group: JSON.stringify(q.order_group || []),
          required: "TRUE",
          metadata: JSON.stringify({ explanation: q.explanation })
        };

        await fetch('/api/proxy/admin/save-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId, question: payload })
        });
        
        setSaveProgress(prev => ({ ...prev, current: i + 1 }));
      }

      toast({ title: "Registry Updated", description: `Added ${questionsToSave.length} AI-generated nodes.` });
      onComplete();
      onOpenChange(false);
      setStep('input');
    } catch (e) {
      toast({ variant: "destructive", title: "Registry Error", description: "Failed to save some questions." });
      setStep('review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !['loading', 'saving'].includes(step) && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
        <DialogHeader className="p-10 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-violet-600 p-3 rounded-2xl shadow-xl rotate-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">AI Assessment Expert</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                Powered by Google Gemini 1.5
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {step === 'input' && <AIInputScreen onGenerate={handleGenerate} />}
          
          {step === 'loading' && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
                <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 uppercase">Generating Registry Nodes...</h4>
                <p className="text-sm font-medium text-slate-400 max-w-[280px] mx-auto italic">
                  Tuning parameters and optimizing intelligence packets.
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <AIReviewScreen 
              questions={generatedQuestions} 
              onSave={handleSaveSelected} 
              onRegenerate={() => setStep('input')} 
            />
          )}

          {step === 'saving' && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900">Committing to Registry...</h4>
                <p className="text-sm font-black text-primary uppercase tracking-widest">
                  Saving {saveProgress.current} of {saveProgress.total}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
