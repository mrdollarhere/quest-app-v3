"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { FileText, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportFormatSelectorProps {
  value: 'pdf' | 'word' | 'json';
  onChange: (val: 'pdf' | 'word' | 'json') => void;
}

export function ExportFormatSelector({ value, onChange }: ExportFormatSelectorProps) {
  const formats = [
    { id: 'pdf', label: 'PDF (.pdf)', icon: FileText },
    { id: 'word', label: 'Word (.docx)', icon: FileText },
    { id: 'json', label: 'JSON (.json)', icon: FileCode }
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <FileCode className="w-4 h-4 text-primary" />
        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Export Format / Định Dạng</Label>
      </div>
      <RadioGroup value={value} onValueChange={(v: any) => onChange(v)} className="grid grid-cols-3 gap-4">
        {formats.map((f) => (
          <div key={f.id} onClick={() => onChange(f.id)} className={cn(
            "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3",
            value === f.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"
          )}>
            <f.icon className={cn("w-6 h-6", value === f.id ? "text-primary" : "text-slate-300")} />
            <span className={cn("text-[10px] font-black uppercase tracking-wider", value === f.id ? "text-primary" : "text-slate-500")}>{f.label}</span>
          </div>
        ))}
      </RadioGroup>
    </section>
  );
}
