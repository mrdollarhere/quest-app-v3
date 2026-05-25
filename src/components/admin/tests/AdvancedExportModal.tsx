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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Settings2, 
  Layers, 
  Shield, 
  Zap, 
  FileCode, 
  HelpCircle, 
  Archive,
  Info,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from '@/types/quiz';

interface ExportConfig {
  format: 'pdf' | 'word' | 'json';
  contentType: 'questions' | 'answers';
  questionCount: number | 'all';
  difficulties: string[];
  versions: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  watermark: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
}

interface AdvancedExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  testTitle: string;
  platformName: string;
  onExport: (config: ExportConfig) => void;
}

export function AdvancedExportModal({ 
  open, 
  onOpenChange, 
  questions, 
  testTitle, 
  platformName, 
  onExport 
}: AdvancedExportModalProps) {
  // 1. REGISTRY STATE NODES
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

  // 2. ANALYTICS NODES
  const hasDifficultyMetadata = useMemo(() => 
    questions.some(q => (q as any).difficulty), 
  [questions]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    questions.forEach(q => {
      const d = (q as any).difficulty || 'Medium';
      if (counts[d] !== undefined) counts[d]++;
    });
    return counts;
  }, [questions]);

  const availableCount = selectionType === 'all' ? questions.length : randomCount;

  // 3. EXPORT CONFIG ASSEMBLER
  const config = useMemo((): ExportConfig => ({
    format,
    contentType: format === 'json' ? 'answers' : contentType,
    questionCount: selectionType === 'all' ? 'all' : randomCount,
    difficulties: selectedDifficulties,
    versions: versionType === 'single' ? 1 : versionCount,
    shuffleQuestions,
    shuffleOptions,
    watermark: {
      enabled: watermarkEnabled && format !== 'json',
      text: watermarkText,
      opacity: watermarkOpacity
    }
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
              <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                Xuất Nâng Cao • {testTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 space-y-12">
          {/* SECTION 1: FORMAT */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <FileCode className="w-4 h-4 text-primary" />
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Export Format / Định Dạng</Label>
            </div>
            <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)} className="grid grid-cols-3 gap-4">
              {[
                { id: 'pdf', label: 'PDF (.pdf)', icon: FileText },
                { id: 'word', label: 'Word (.docx)', icon: FileText },
                { id: 'json', label: 'JSON (.json)', icon: FileCode }
              ].map((f) => (
                <div key={f.id} onClick={() => setFormat(f.id as any)} className={cn(
                  "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3",
                  format === f.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"
                )}>
                  <f.icon className={cn("w-6 h-6", format === f.id ? "text-primary" : "text-slate-300")} />
                  <span className={cn("text-[10px] font-black uppercase tracking-wider", format === f.id ? "text-primary" : "text-slate-500")}>{f.label}</span>
                </div>
              ))}
            </RadioGroup>
          </section>

          {/* SECTION 2: CONTENT TYPE (HIDE IF JSON) */}
          {format !== 'json' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-primary" />
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Content / Nội Dung</Label>
              </div>
              <RadioGroup value={contentType} onValueChange={(v: any) => setContentType(v)} className="grid grid-cols-2 gap-4">
                {[
                  { id: 'questions', title: 'Questions Only', sub: 'Chỉ Câu Hỏi', icon: FileText },
                  { id: 'answers', title: 'With Answer Key', sub: 'Kèm Đáp Án', icon: CheckCircle2 }
                ].map((c) => (
                  <div key={c.id} onClick={() => setContentType(c.id as any)} className={cn(
                    "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6",
                    contentType === c.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"
                  )}>
                    <c.icon className={cn("w-8 h-8", contentType === c.id ? "text-primary" : "text-slate-300")} />
                    <div>
                      <p className={cn("text-sm font-black uppercase tracking-tight", contentType === c.id ? "text-slate-900" : "text-slate-500")}>{c.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </section>
          )}

          {/* SECTION 3: QUESTION SELECTION */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-primary" />
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Questions / Câu Hỏi</Label>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                {questions.length} Total Nodes / Tổng số câu
              </span>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
              {hasDifficultyMetadata && (
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Filter by Difficulty / Lọc theo độ khó</p>
                  <div className="flex flex-wrap gap-4">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <div key={d} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm">
                        <Checkbox 
                          id={`diff-${d}`} 
                          checked={selectedDifficulties.includes(d)}
                          onCheckedChange={(val) => {
                            if (val) setSelectedDifficulties([...selectedDifficulties, d]);
                            else setSelectedDifficulties(selectedDifficulties.filter(item => item !== d));
                          }}
                        />
                        <Label htmlFor={`diff-${d}`} className="text-[10px] font-bold uppercase cursor-pointer">
                          {d} ({difficultyCounts[d]})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <RadioGroup value={selectionType} onValueChange={(v: any) => setSelectionType(v)} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="text-xs font-bold cursor-pointer">All questions / Tất cả câu hỏi</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random" className="text-xs font-bold cursor-pointer">Random selection / Chọn ngẫu nhiên</Label>
                  </div>
                </RadioGroup>

                {selectionType === 'random' && (
                  <div className="pl-7 space-y-4 animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <Label className="text-[9px] font-black uppercase text-slate-400">Count / Số câu</Label>
                        <Input 
                          type="number" 
                          min={1} 
                          max={questions.length} 
                          value={randomCount}
                          onChange={(e) => setRandomCount(parseInt(e.target.value) || 1)}
                          className="h-10 rounded-xl bg-white font-black"
                        />
                      </div>
                      <div className="flex-1 pt-6">
                        <p className="text-[11px] font-bold text-primary italic">
                          Will export {randomCount} of {questions.length} questions
                          <br />
                          <span className="text-[10px] opacity-70">Sẽ xuất {randomCount} trong {questions.length} câu hỏi</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: VERSIONS */}
          {format !== 'json' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-primary" />
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Versions / Số Phiên Bản</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setVersionType('single')}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all cursor-pointer",
                    versionType === 'single' ? "bg-primary/5 border-primary" : "bg-white border-slate-100"
                  )}
                >
                  <p className={cn("text-xs font-black uppercase", versionType === 'single' ? "text-primary" : "text-slate-400")}>Single version</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Một phiên bản</p>
                </div>
                <div 
                  onClick={() => setVersionType('multiple')}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all cursor-pointer",
                    versionType === 'multiple' ? "bg-primary/5 border-primary" : "bg-white border-slate-100"
                  )}
                >
                  <p className={cn("text-xs font-black uppercase", versionType === 'multiple' ? "text-primary" : "text-slate-400")}>Multiple versions</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Nhiều phiên bản</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                {versionType === 'multiple' && (
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-200/50 animate-in slide-in-from-top-2">
                    <div className="w-32">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Versions / Số bản</Label>
                      <Input 
                        type="number" 
                        min={2} 
                        max={10} 
                        value={versionCount}
                        onChange={(e) => setVersionCount(parseInt(e.target.value) || 2)}
                        className="h-10 rounded-xl bg-white font-black"
                      />
                    </div>
                    <div className="flex-1 flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <Archive className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                        Multiple versions will be packaged as a ZIP file.
                        <br />
                        <span className="opacity-80">Nhiều phiên bản sẽ được nén thành file ZIP.</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Checkbox id="shuffle-q" checked={shuffleQuestions} onCheckedChange={(v) => setShuffleQuestions(!!v)} />
                    <div className="leading-tight">
                      <Label htmlFor="shuffle-q" className="text-[10px] font-black uppercase cursor-pointer">Shuffle questions</Label>
                      <p className="text-[9px] font-medium text-slate-400">Xáo thứ tự câu hỏi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="shuffle-o" checked={shuffleOptions} onCheckedChange={(v) => setShuffleOptions(!!v)} />
                    <div className="leading-tight">
                      <Label htmlFor="shuffle-o" className="text-[10px] font-black uppercase cursor-pointer">Shuffle options</Label>
                      <p className="text-[9px] font-medium text-slate-400">Xáo thứ tự đáp án</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: WATERMARK */}
          {format !== 'json' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Watermark / Hình Mờ</Label>
                </div>
                <Switch checked={watermarkEnabled} onCheckedChange={setWatermarkEnabled} />
              </div>

              {watermarkEnabled && (
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8 animate-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Watermark Text / Chữ hình mờ</Label>
                    <Input 
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="h-12 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[9px] font-black uppercase text-slate-400">Opacity / Độ mờ</Label>
                      <span className="text-[10px] font-black text-primary uppercase">
                        {watermarkOpacity <= 10 ? 'Light' : watermarkOpacity <= 20 ? 'Medium' : 'Dark'} ({watermarkOpacity}%)
                      </span>
                    </div>
                    <Slider 
                      value={[watermarkOpacity]} 
                      onValueChange={(v) => setWatermarkOpacity(v[0])} 
                      min={5} 
                      max={40} 
                      step={5} 
                      className="py-2"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECTION 6: SUMMARY */}
          <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden border-none shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Info className="w-16 h-16" />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Export Summary / Tóm Tắt</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                <SummaryNode label="Format" value={format.toUpperCase()} />
                <SummaryNode label="Items" value={availableCount} />
                <SummaryNode label="Versions" value={`${config.versions}${config.versions > 1 ? ' (ZIP)' : ''}`} />
                <SummaryNode label="Answers" value={config.contentType === 'answers' ? 'Yes' : 'No'} />
                {watermarkEnabled && <SummaryNode label="Security" value="Watermark On" />}
                <SummaryNode label="Shuffle" value={shuffleQuestions || shuffleOptions ? 'Active' : 'Off'} />
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="p-10 border-t bg-slate-50/50 gap-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest text-slate-400">
            Cancel / Hủy
          </Button>
          <Button 
            onClick={() => onExport(config)}
            className="h-14 px-12 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 border-none"
          >
            Generate Export / Xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryNode({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
      <p className="text-xs font-bold text-white uppercase">{value}</p>
    </div>
  );
}
