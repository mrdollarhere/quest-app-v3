"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Shield } from "lucide-react";

interface ExportWatermarkSelectorProps {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  text: string;
  setText: (val: string) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  hidden: boolean;
}

export function ExportWatermarkSelector({
  enabled, setEnabled, text, setText, opacity, setOpacity, hidden
}: ExportWatermarkSelectorProps) {
  if (hidden) return null;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" />
          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Watermark / Hình Mờ</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8 animate-in slide-in-from-top-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Watermark Text / Chữ hình mờ</Label>
            <Input 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. CONFIDENTIAL"
              className="h-12 rounded-xl bg-white font-bold"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[9px] font-black uppercase text-slate-400">Opacity / Độ mờ</Label>
              <span className="text-[10px] font-black text-primary uppercase">
                {opacity <= 10 ? 'Light' : opacity <= 20 ? 'Medium' : 'Dark'} ({opacity}%)
              </span>
            </div>
            <Slider 
              value={[opacity]} 
              onValueChange={(v) => setOpacity(v[0])} 
              min={5} 
              max={40} 
              step={5} 
              className="py-2"
            />
          </div>
        </div>
      )}
    </section>
  );
}
