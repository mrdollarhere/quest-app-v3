/**
 * QuestionPreviewPane.tsx
 * 
 * Purpose: Renders a real-time simulator of the question being edited.
 * Used by: src/components/admin/dialogs/QuestionDialog.tsx
 * Props:
 *   - showPreview: boolean — visibility toggle
 *   - previewQuestion: Question — the temporary question object
 *   - textSize: string — simulated typography scale
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { Question } from '@/types/quiz';

interface QuestionPreviewPaneProps {
  showPreview: boolean;
  previewQuestion: Question;
  textSize: string;
}

export function QuestionPreviewPane({ showPreview, previewQuestion, textSize }: QuestionPreviewPaneProps) {
  if (!showPreview) return null;

  return (
    <div className="hidden lg:flex flex-1 flex-col bg-slate-50/50 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terminal Preview</span>
        </div>
        <div className="px-3 py-1 bg-white rounded-full border shadow-sm text-[8px] font-black text-primary uppercase">Simulation Protocol</div>
      </div>
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
          <QuestionRenderer 
            question={previewQuestion}
            value={null}
            onChange={() => {}}
            reviewMode={false}
          />
        </div>
        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Simulation Mode — Data Persistence Restricted</p>
        </div>
      </div>
    </div>
  );
}
