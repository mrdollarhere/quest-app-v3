"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceFieldsProps {
  type: string;
  options: string[];
  setOptions: (opts: string[]) => void;
  correct: string[];
  setCorrect: (ans: string[]) => void;
  disabled?: boolean;
}

export function ChoiceFields({ type, options, setOptions, correct, setCorrect, disabled }: ChoiceFieldsProps) {
  const toggleCorrect = (val: string) => {
    if (disabled) return;
    if (type === 'multiple_choice') {
      setCorrect(correct.includes(val) ? correct.filter(c => c !== val) : [...correct, val]);
    } else {
      setCorrect([val]);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const text = e.clipboardData.getData('text');
    if (!text) return;

    let items: string[] = [];
    if (text.includes('\n')) {
      items = text.split('\n');
    } else if (text.includes(',')) {
      items = text.split(',');
    }

    if (items.length <= 1) return;

    e.preventDefault();

    const cleanItems = items
      .map(item => {
        let cleaned = item.trim();
        cleaned = cleaned.replace(/^([0-9a-z][.\)]\s*)/i, '');
        return cleaned.trim();
      })
      .filter(item => item.length > 0);

    if (cleanItems.length === 0) return;

    const newOptions = [...options];
    for (let i = 0; i < cleanItems.length; i++) {
      newOptions[index + i] = cleanItems[i];
    }

    setOptions(newOptions);
  };

  return (
    <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">Interaction Options</Label>
        <Button 
          type="button" 
          size="sm" 
          onClick={() => setOptions([...options, `Option ${options.length + 1}`])} 
          disabled={disabled}
          className="rounded-full bg-slate-900 text-white"
        >
          <Plus className="w-3 h-3 mr-2" /> Add Choice
        </Button>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center group">
            {['single_choice', 'multiple_choice', 'dropdown'].includes(type) && (
              <div className="w-10 flex justify-center">
                {type === 'multiple_choice' ? (
                  <Checkbox 
                    checked={correct.includes(opt)} 
                    onCheckedChange={() => toggleCorrect(opt)} 
                    disabled={disabled}
                  />
                ) : (
                  <button 
                    type="button" 
                    onClick={() => toggleCorrect(opt)} 
                    disabled={disabled}
                    className={cn(
                      "w-5 h-5 rounded-full border-2", 
                      correct.includes(opt) ? "bg-primary border-primary" : "border-slate-300",
                      disabled && "opacity-50 cursor-not-allowed"
                    )} 
                  />
                )}
              </div>
            )}
            <Input 
              value={opt} 
              disabled={disabled}
              onPaste={(e) => handlePaste(i, e)}
              onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} 
              className="rounded-xl h-12 bg-white flex-1" 
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              disabled={disabled}
              onClick={() => setOptions(options.filter((_, idx) => idx !== i))} 
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
