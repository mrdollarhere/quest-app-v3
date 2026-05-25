"use client";

import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Question } from '@/types/quiz';

// Section Extraction Nodes (Protocol v19.0)
import { ExportFormatSelector } from './export/ExportFormatSelector';
import { ExportContentSelector } from './export/ExportContentSelector';
import { ExportQuestionSelector } from './export/ExportQuestionSelector';
import { ExportVersionSelector } from './export/ExportVersionSelector';
import { ExportWatermarkSelector } from './export/ExportWatermarkSelector';
import { ExportSummaryCard } from './export/ExportSummaryCard';

interface AdvancedExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  testTitle: string;
  platformName: string;
  onExport: (config: any) => void;
}

export function AdvancedExportModal({ 
  open, onOpenChange, questions, testTitle, platformName, onExport 
}: AdvancedExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'word' | 'json'>('pdf');
  const [contentType, setContentType] = useState<'questions' | 'answers'>('questions');
  const [selectionType, setSelectionType] = useState<'all' | 'random'>('all');
  const [randomCount, setRandomCount] = useState(Math.min(20, questions.length));
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [versionType, setVersionType] = useState<'single' | 'multiple'>('single');
  const [versionCount, setVersionCount] = useState(3);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState(`${platformName} CONFIDENTIAL`);
  const [watermarkOpacity, setWatermarkOpacity] = useState(10);

  const config = useMemo(() => ({
    format,
    contentType: format === 'json' ? 'answers' : contentType,
    questionCount: selectionType === 'all' ? 'all' : randomCount,
    difficulties: selectedDifficulties,
    versions: (format === 'json' || versionType === 'single') ? 1 : versionCount,
    shuffleQuestions,
    shuffleOptions,
    watermark: { enabled: watermarkEnabled && format !== 'json', text: watermarkText, opacity: watermarkOpacity / 100 }
  }), [format, contentType, selectionType, randomCount, selectedDifficulties, versionType, versionCount, shuffleQuestions, shuffleOptions, watermarkEnabled, watermarkText, watermarkOpacity]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl bg-white custom-scrollbar">
        <DialogHeader className="p-10 bg-slate-900 text-white shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-3">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">Advanced Export</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Xuất Nâng Cao • {testTitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-12">
          <ExportFormatSelector value={format} onChange={setFormat} />
          <ExportContentSelector value={contentType} onChange={setContentType} hidden={format === 'json'} />
          <ExportQuestionSelector 
            questions={questions} selectionType={selectionType} setSelectionType={setSelectionType} 
            randomCount={randomCount} setRandomCount={setRandomCount} 
            selectedDifficulties={selectedDifficulties} setSelectedDifficulties={setSelectedDifficulties} 
          />
          <ExportVersionSelector 
            versionType={versionType} setVersionType={setVersionType} versionCount={versionCount} setVersionCount={setVersionCount}
            shuffleQuestions={shuffleQuestions} setShuffleQuestions={setShuffleQuestions} 
            shuffleOptions={shuffleOptions} setShuffleOptions={setShuffleOptions}
            hidden={format === 'json'}
          />
          <ExportWatermarkSelector 
            enabled={watermarkEnabled} setEnabled={setWatermarkEnabled} 
            text={watermarkText} setText={setWatermarkText} 
            opacity={watermarkOpacity} setOpacity={setWatermarkOpacity}
            hidden={format === 'json'}
          />
          <ExportSummaryCard 
            format={format} count={selectionType === 'all' ? questions.length : randomCount} 
            versions={config.versions} withAnswers={config.contentType === 'answers'}
            watermarkEnabled={watermarkEnabled && format !== 'json'} 
            shuffleActive={shuffleQuestions || shuffleOptions}
          />
        </div>

        <DialogFooter className="p-10 border-t bg-slate-50/50 gap-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest text-slate-400">Cancel / Hủy</Button>
          <Button onClick={() => onExport(config)} className="h-14 px-12 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 border-none">Generate Export / Xuất</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
