/**
 * UserHistoryTable.tsx
 * 
 * Purpose: Renders the chronological mission log for a specific student.
 * Extracted: v19.0 (CEP)
 */

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserHistoryTableProps {
  data: any[];
  threshold: number;
}

export function UserHistoryTable({ data, threshold }: UserHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none">
          <TableHead className="px-8 font-black uppercase text-[9px] tracking-widest text-slate-400">Date & Time</TableHead>
          <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Assessment Module</TableHead>
          <TableHead className="font-black uppercase text-[9px] tracking-widest text-center text-slate-400">Score</TableHead>
          <TableHead className="font-black uppercase text-[9px] tracking-widest text-center text-slate-400">Verdict</TableHead>
          <TableHead className="px-8 text-right font-black uppercase text-[9px] tracking-widest text-slate-400">Precision</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((resp, i) => {
          const score = Number(resp.Score) || 0;
          const total = Number(resp.Total) || 1;
          const pct = Math.round((score / total) * 100);
          const isPass = pct >= threshold;
          
          return (
            <TableRow key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
              <TableCell className="px-8 py-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">
                    {new Date(resp.Timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(resp.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-black text-slate-700 dark:text-slate-300 text-sm">{resp['Test ID']}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{resp.Mode || 'standard'}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-bold text-slate-500">
                <span className="text-slate-900 dark:text-white font-black">{score}</span>
                <span className="text-[10px] text-slate-300 mx-1">/</span>
                <span className="text-xs">{total}</span>
              </TableCell>
              <TableCell className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  isPass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {isPass ? "Pass" : "Fail"}
                </div>
              </TableCell>
              <TableCell className="px-8 text-right">
                <Badge className={cn(
                  "font-black px-3 py-1 rounded-full border-none shadow-sm text-[9px] uppercase tracking-widest",
                  pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= threshold ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                )}>
                  {pct}%
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
