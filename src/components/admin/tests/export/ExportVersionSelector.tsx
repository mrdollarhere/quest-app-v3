"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportVersionSelectorProps {
  versionType: 'single' | 'multiple';
  setVersionType: (val: 'single' | 'multiple') => void;
  versionCount: number;
  setVersionCount: (val: number) => void;
  shuffleQuestions: boolean;
  setShuffleQuestions: (val: boolean) => void;
  shuffleOptions: boolean;
  setShuffleOptions: (val: boolean) => void;
  hidden: boolean;
}

export function ExportVersionSelector({
  versionType, setVersionType, versionCount, setVersionCount,
  shuffleQuestions, setShuffleQuestions, shuffleOptions, setShuffleOptions,
  hidden
}: ExportVersionSelectorProps) {
  if (hidden) return null;

  return (
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
  );
}
