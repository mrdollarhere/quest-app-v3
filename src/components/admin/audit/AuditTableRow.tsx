
/**
 * AuditTableRow.tsx
 * 
 * Purpose: Renders a standardized row for the Unified System Activity Hub.
 * Logic: Handles identity display, event badging, and expansion triggers.
 */

import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Monitor, Copy, History, LogIn, LogOut, MousePointer2, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AuditTableRowProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyIP: (ip: string) => void;
}

export function AuditTableRow({ item, isExpanded, onToggle, onCopyIP }: AuditTableRowProps) {
  const getEventBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('login')) return { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: LogIn };
    if (t.includes('logout')) return { color: "bg-orange-50 text-orange-600 border-orange-100", icon: LogOut };
    if (t.includes('page_view')) return { color: "bg-blue-50 text-blue-600 border-blue-100", icon: MousePointer2 };
    if (t.includes('security') || t.includes('failure')) return { color: "bg-rose-50 text-rose-600 border-rose-100", icon: ShieldCheck };
    return { color: "bg-slate-50 text-slate-500 border-slate-100", icon: History };
  };

  const badge = getEventBadge(item.event_type);

  return (
    <TableRow 
      className={cn(
        "group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none cursor-pointer",
        isExpanded && "bg-slate-50/50 dark:bg-slate-800/50"
      )}
      onClick={onToggle}
    >
      <TableCell className="px-10 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-bold tabular-nums">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-xs shrink-0 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-slate-900 dark:text-white text-xs uppercase truncate leading-none mb-1">{item.user_name}</span>
            <span className="text-[10px] font-medium text-slate-400 truncate">{item.user_email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-black text-[9px] uppercase tracking-widest", badge.color)}>
          <badge.icon className="w-3 h-3" />
          {item.event_type.replace(/_/g, ' ')}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={item.context}>
          {item.context}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <button 
          onClick={(e) => { e.stopPropagation(); onCopyIP(item.ip); }}
          className="font-mono text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-2 mx-auto px-2 py-1 hover:bg-slate-100 rounded-lg"
        >
          {item.ip}
          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-slate-500">
            <Monitor className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-bold truncate max-w-[120px]">{item.device || 'N/A'}</span>
          </div>
          <span className="text-[9px] text-slate-400 ml-5 truncate max-w-[120px] italic">{item.browser !== 'N/A' ? item.browser : ''}</span>
        </div>
      </TableCell>
      <TableCell className="px-10 text-right">
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-none font-black text-[9px] uppercase px-3">
            {item.user_role}
          </Badge>
          <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">{item.status}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
