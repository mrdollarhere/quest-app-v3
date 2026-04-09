"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface MatrixFieldsProps {
  rows: string[];
  setRows: (r: string[]) => void;
  cols: string[];
  setCols: (c: string[]) => void;
  correct: string[];
  setCorrect: (ans: string[]) => void;
  disabled?: boolean;
}

export function MatrixFields({ rows, setRows, cols, setCols, correct, setCorrect, disabled }: MatrixFieldsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">Column Headers</Label>
          <Button 
            type="button" 
            size="sm" 
            onClick={() => setCols([...cols, `Col ${cols.length + 1}`])} 
            disabled={disabled}
            className="rounded-full bg-slate-900 text-white"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cols.map((col, i) => (
            <div key={i} className="flex items-center gap-1 bg-white p-1 rounded-xl ring-1 ring-slate-200">
              <Input 
                value={col} 
                disabled={disabled}
                onChange={(e) => { const n = [...cols]; n[i] = e.target.value; setCols(n); }} 
                className="h-8 w-24 border-none shadow-none text-xs" 
              />
              <button 
                type="button" 
                disabled={disabled}
                onClick={() => setCols(cols.filter((_, idx) => idx !== i))} 
                className="p-1 text-slate-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">Row Registry</Label>
          <Button 
            type="button" 
            size="sm" 
            onClick={() => setRows([...rows, `Row ${rows.length + 1}`])} 
            disabled={disabled}
            className="rounded-full bg-slate-900 text-white"
          >
            <Plus className="w-3 h-3" />
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
            <select 
              value={correct[i] || ""} 
              disabled={disabled}
              onChange={(e) => { const n = [...correct]; n[i] = e.target.value; setCorrect(n); }} 
              className="h-12 rounded-xl bg-white border px-4 text-[10px] font-black uppercase text-primary w-40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Map Choice</option>
              {cols.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
            </select>
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
    </div>
  );
}
