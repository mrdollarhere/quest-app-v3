"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { FileText, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportContentSelectorProps {
  value: 'questions' | 'answers';
  onChange: (val: 'questions' | 'answers') => void;
  hidden: boolean;
}

export function ExportContentSelector({ value, onChange, hidden }: ExportContentSelectorProps) {
  if (hidden) return null;

  const contentTypes = [
    { id: 'questions', title: 'Questions Only', sub: 'Chỉ Câu Hỏi', icon: FileText },
    { id: 'answers', title: 'With Answer Key', sub: 'Kèm Đáp Án', icon: CheckCircle2 }
  ] as const;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-4 h-4 text-primary" />
        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Content / Nội Dung</Label>
      </div>
      <RadioGroup value={value} onValueChange={(v: any) => onChange(v)} className="grid grid-cols-2 gap-4">
        {contentTypes.map((c) => (
          <div key={c.id} onClick={() => onChange(c.id)} className={cn(
            "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6",
            value === c.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"
          )}>
            <c.icon className={cn("w-8 h-8", value === c.id ? "text-primary" : "text-slate-300")} />
            <div>
              <p className={cn("text-sm font-black uppercase tracking-tight", value === c.id ? "text-slate-900" : "text-slate-500")}>{c.title}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.sub}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </section>
  );
}
