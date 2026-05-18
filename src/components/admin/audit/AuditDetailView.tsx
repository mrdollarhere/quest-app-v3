
/**
 * AuditDetailView.tsx
 * 
 * Purpose: Renders the expandable forensic metadata for a system pulse.
 */

import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';

interface AuditDetailViewProps {
  item: any;
  onClose: () => void;
}

export function AuditDetailView({ item, onClose }: AuditDetailViewProps) {
  const formatValue = (val: any) => {
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val || 'N/A');
  };

  return (
    <TableRow className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
      <TableCell colSpan={7} className="p-8 px-12">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800 shadow-inner space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forensic Metadata Breakdown</h4>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 px-4 font-black uppercase text-[9px]">Close</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {Object.entries(item.details || {}).map(([key, val]: any) => (
              <div key={key} className="flex gap-4 text-[11px] py-1 border-b dark:border-slate-800 last:border-none">
                <span className="font-black uppercase tracking-widest text-slate-400 min-w-[140px] shrink-0">{key.replace(/_/g, ' ')}:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold break-all">
                  {formatValue(val)}
                </span>
              </div>
            ))}
            {Object.keys(item.details || {}).length === 0 && (
              <p className="text-[10px] text-slate-400 italic">No additional metadata registered for this pulse.</p>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
