/**
 * ResponseTableRow.tsx
 * 
 * Purpose: Renders a standardized row for the mission history table.
 */

import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Flag, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResponseTableRowProps {
  r: any;
  threshold: number;
  onDelete: () => void;
}

export function ResponseTableRow({ r, threshold, onDelete }: ResponseTableRowProps) {
  const pct = Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100);
  
  // ANTI-CHEAT REGISTRY CHECK
  const isFlagged = r.flagged === true || String(r.flagged).toUpperCase() === 'TRUE';
  const violationCount = Number(r.violationCount || 0);

  return (
    <TableRow className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
      <TableCell className="px-10 py-6 text-[11px] font-bold text-slate-400 tabular-nums">
        <div className="flex items-center gap-3">
          {isFlagged && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600 animate-pulse cursor-help">
                    <Flag className="w-3.5 h-3.5 fill-current" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3 shadow-2xl">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Security Flag</p>
                    <p className="text-xs font-bold">{violationCount} Integrity Violations</p>
                    <p className="text-[10px] opacity-60 italic">{r.flagReason || 'Tab switching detected'}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span>
            {new Date(r.Timestamp).toLocaleDateString()} {new Date(r.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Link href={`/admin/users/detail?email=${encodeURIComponent(r['User Email'])}`} className="font-black uppercase text-slate-700 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-2 group/link">
          {r['User Name']}
          <Eye className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover/link:text-primary transition-all" />
        </Link>
      </TableCell>
      <TableCell className="font-bold text-slate-500 dark:text-slate-400">{r['Test ID']}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white">{r.Score} / {r.Total}</span>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            pct >= threshold ? "text-emerald-500" : "text-rose-500"
          )}>
            {pct}% Accuracy
          </span>
        </div>
      </TableCell>
      <TableCell className="px-10 text-right">
        <Button 
          variant="ghost" 
          size="icon" 
          className="opacity-0 group-hover:opacity-100 h-9 w-9 rounded-xl text-destructive hover:bg-rose-50 hover:text-rose-600 transition-all" 
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
