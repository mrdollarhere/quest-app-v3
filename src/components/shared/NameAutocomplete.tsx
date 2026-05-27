"use client";

/**
 * NameAutocomplete.tsx
 * 
 * UI Component for displaying the identity suggestion dropdown.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, User } from 'lucide-react';

interface Suggestion {
  name: string;
  isApproved: boolean;
}

interface NameAutocompleteProps {
  suggestions: Suggestion[];
  isOpen: boolean;
  highlightedIndex: number;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
}

export function NameAutocomplete({ 
  suggestions, 
  isOpen, 
  highlightedIndex, 
  onSelect, 
  onHover 
}: NameAutocompleteProps) {
  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-[200] mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
        {suggestions.map((s, i) => (
          <div
            key={s.name}
            onMouseEnter={() => onHover(i)}
            onClick={() => onSelect(s.name)}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all",
              highlightedIndex === i ? "bg-primary/5 text-primary" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors",
                highlightedIndex === i ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
              )}>
                <User className="w-4 h-4" />
              </div>
              <span className="font-black uppercase text-xs tracking-tight">{s.name}</span>
            </div>
            
            {s.isApproved && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Approved</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-50 p-2 border-t flex justify-center">
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
          Use arrows to navigate • Enter to select
        </p>
      </div>
    </div>
  );
}
