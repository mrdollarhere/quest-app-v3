"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Link2 } from "lucide-react";

interface MatchingFieldsProps {
  pairs: { left: string, right: string }[];
  setPairs: (p: { left: string, right: string }[]) => void;
  disabled?: boolean;
}

export function MatchingFields({ pairs, setPairs, disabled }: MatchingFieldsProps) {
  return (
    <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">Node Matching Pairs</Label>
        <Button 
          type="button" 
          size="sm" 
          onClick={() => setPairs([...pairs, { left: '', right: '' }])} 
          disabled={disabled}
          className="rounded-full bg-slate-900 text-white"
        >
          <Plus className="w-3 h-3 mr-2" /> New Pair
        </Button>
      </div>
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-3 group">
          <Input 
            value={pair.left} 
            disabled={disabled}
            onChange={(e) => { const n = [...pairs]; n[idx].left = e.target.value; setPairs(n); }} 
            placeholder="Left..." 
            className="rounded-xl h-12 bg-white flex-1" 
          />
          <Link2 className="w-4 h-4 text-slate-300" />
          <Input 
            value={pair.right} 
            disabled={disabled}
            onChange={(e) => { const n = [...pairs]; n[idx].right = e.target.value; setPairs(n); }} 
            placeholder="Right..." 
            className="rounded-xl h-12 bg-white flex-1" 
          />
          <Button 
            type="button" 
            variant="ghost" 
            disabled={disabled}
            onClick={() => setPairs(pairs.filter((_, i) => i !== idx))} 
            className="opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4 text-slate-300" />
          </Button>
        </div>
      ))}
    </div>
  );
}
