"use client";

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Download, 
  ChevronDown, 
  Monitor, 
  ShieldCheck, 
  MousePointer2, 
  LogIn, 
  LogOut,
  Info,
  Copy,
  Clock,
  User,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Pagination } from '../Pagination';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { useToast } from '@/hooks/use-toast';

interface UnifiedAuditTerminalProps {
  data: any[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (val: any) => void;
  dateRange: string;
  setDateRange: (val: any) => void;
  displaySearch: string;
  setDisplaySearch: (val: string) => void;
  onRefresh: () => void;
}

export function UnifiedAuditTerminal({ 
  data, 
  loading, 
  activeTab, 
  setActiveTab, 
  dateRange, 
  setDateRange, 
  displaySearch, 
  setDisplaySearch,
  onRefresh
}: UnifiedAuditTerminalProps) {
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { currentPage, setCurrentPage, paginatedData, totalItems, pageSize } = useRegistryFilter({
    data: data,
    searchFields: (item) => [item.user_name, item.user_email, item.event_type, item.ip, item.context],
    pageSize: 20
  });

  const toggleRow = (idx: number) => {
    const next = new Set(expandedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedRows(next);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} saved to clipboard.` });
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["Timestamp", "User", "Email", "Event", "Context", "IP Address", "Device", "Status", "Role"];
    const rows = data.map(item => [
      new Date(item.timestamp).toISOString(),
      item.user_name,
      item.user_email,
      item.event_type,
      item.context,
      item.ip,
      `${item.device} • ${item.browser}`,
      item.status,
      item.user_role
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dntrng_audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Complete", description: "Forensic CSV generated." });
  };

  const getEventBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('login')) return { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: LogIn };
    if (t.includes('logout')) return { color: "bg-orange-50 text-orange-600 border-orange-100", icon: LogOut };
    if (t.includes('page_view')) return { color: "bg-blue-50 text-blue-600 border-blue-100", icon: MousePointer2 };
    if (t.includes('security') || t.includes('failure')) return { color: "bg-rose-50 text-rose-600 border-rose-100", icon: ShieldCheck };
    return { color: "bg-slate-50 text-slate-500 border-slate-100", icon: History };
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <TabsList className="bg-transparent h-10">
              <TabsTrigger value="all" className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest">All</TabsTrigger>
              <TabsTrigger value="access" className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest">Logins</TabsTrigger>
              <TabsTrigger value="views" className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest">Page Views</TabsTrigger>
              <TabsTrigger value="nav" className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest">Navigation</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex bg-slate-50 dark:bg-slate-800 border rounded-2xl p-1 gap-1">
            {['today', 'week', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
                  dateRange === r ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Filter identity or IP..." 
              value={displaySearch}
              onChange={(e) => setDisplaySearch(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-bold text-xs"
            />
          </div>
        </div>

        <Button onClick={handleExportCSV} className="rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest bg-slate-900 dark:bg-primary text-white shadow-xl hover:scale-[1.02] transition-all">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-transparent border-none">
              <TableHead className="px-10 py-6 font-black uppercase text-[9px] tracking-widest text-slate-400">Timestamp</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Identity Node</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Event</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Context / Page</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400 text-center">IP Address</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Platform</TableHead>
              <TableHead className="px-10 text-right font-black uppercase text-[9px] tracking-widest text-slate-400">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, i) => {
              const isExpanded = expandedRows.has(i);
              const badge = getEventBadge(item.event_type);
              
              return (
                <React.Fragment key={i}>
                  <TableRow 
                    className={cn(
                      "group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none cursor-pointer",
                      isExpanded && "bg-slate-50/50 dark:bg-slate-800/50"
                    )}
                    onClick={() => toggleRow(i)}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={item.context}>
                          {item.context}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(item.ip, "IP Address"); }}
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
                  {isExpanded && (
                    <TableRow className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                      <TableCell colSpan={7} className="p-8 px-12">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800 shadow-inner space-y-6 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Info className="w-4 h-4 text-primary" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forensic Metadata Breakdown</h4>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleRow(i); }} className="rounded-full h-8 px-4 font-black uppercase text-[9px]">Close</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {Object.entries(item.details || {}).map(([key, val]: any) => (
                              <div key={key} className="flex gap-4 text-[11px] py-1 border-b dark:border-slate-800 last:border-none">
                                <span className="font-black uppercase tracking-widest text-slate-400 min-w-[140px] shrink-0">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-slate-700 dark:text-slate-300 font-bold break-all">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
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
                  )}
                </React.Fragment>
              );
            })}
            {!loading && totalItems === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-40 text-center">
                  <div className="flex flex-col items-center gap-6 opacity-20">
                    <History className="w-16 h-16" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Timeline Empty</h3>
                      <p className="text-sm font-medium uppercase tracking-widest">No matching pulses found in the current registry slice</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination 
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
