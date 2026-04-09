"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BooleanFieldsProps {
  type: string;
  rows: string[];
  setRows: (r: string[]) => void;
  correct: string[];
  setCorrect: (c: string[]) => void;
  disabled?: boolean;
}

export function BooleanFields({ type, rows, setRows, correct, setCorrect, disabled }: BooleanFieldsProps) {
  if (type === 'true_false') {
    return (
      <div className="p-8 bg-slate-50 rounded-[2rem] border">
        <Label className="text-[10px] font-black uppercase text-slate-400">Boolean Resolution</Label>
        <RadioGroup value={correct[0] || "True"} onValueChange={(v) => setCorrect([v])} disabled={disabled} className="flex gap-4 mt-4">
          {['True', 'False'].map(v => (
            <div key={v} className={cn("flex-1 p-6 rounded-2xl border-2 flex items-center gap-4 bg-white", correct[0] === v ? "border-primary" : "border-slate-100")}>
              <RadioGroupItem value={v} id={v} />
              <Label htmlFor={v} className="font-black">{v}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">Statement Sequence</Label>
        <Button 
          type="button" 
          size="sm" 
          onClick={() => setRows([...rows, `Statement ${rows.length + 1}`])} 
          disabled={disabled}
          className="rounded-full bg-slate-900 text-white"
        >
          <Plus className="w-3 h-3 mr-2" /> Add Statement
        </Button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center group">
          <Input 
            value={row} 
            disabled={disabled}
            onChange={(e) => { const n = [...rows]; n[i] = e.target.value; setRows(n); }} 
            className="rounded-xl h-12 bg-white flex-1" 
          />
          <div className="flex gap-1 bg-white p-1 rounded-xl border">
            {['True', 'False'].map(v => (
              <button 
                key={v} 
                type="button" 
                disabled={disabled}
                onClick={() => { const n = [...correct]; n[i] = v; setCorrect(n); }} 
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase", correct[i] === v ? "bg-primary text-white" : "text-slate-400")}
              >
                {v}
              </button>
            ))}
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            disabled={disabled}
            onClick={() => { setRows(rows.filter((_, idx) => idx !== i)); setCorrect(correct.filter((_, idx) => idx !== i)); }} 
            className="opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4 text-slate-300" />
          </Button>
        </div>
      ))}
    </div>
  );
}
