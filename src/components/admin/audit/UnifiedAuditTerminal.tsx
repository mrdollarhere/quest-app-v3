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
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Pagination } from '../Pagination';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { useToast } from '@/hooks/use-toast';
import { AuditTableRow } from './AuditTableRow';
import { AuditDetailView } from './AuditDetailView';

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

/**
 * UNIFIED AUDIT TERMINAL
 * 
 * Orchestrates the high-capacity forensic audit table.
 * Implements tactical filtering, date ranges, and CSV extraction.
 */
export function UnifiedAuditTerminal({ 
  data, 
  loading, 
  activeTab, 
  setActiveTab, 
  dateRange, 
  setDateRange, 
  displaySearch, 
  setDisplaySearch
}: UnifiedAuditTerminalProps) {
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // TACTICAL FILTERING PROTOCOL
  const filteredByTab = data.filter(item => {
    if (activeTab === 'access') {
      const types = ['login', 'logout', 'daily_key_failure', 'auth_denied'];
      return types.includes(item.event_type.toLowerCase());
    }
    if (activeTab === 'views') {
      return item.event_type.toLowerCase() === 'page_view';
    }
    if (activeTab === 'nav') {
      return item.event_type.toLowerCase().includes('navigation') || item.event_type.toLowerCase().includes('click');
    }
    return true;
  });

  const filteredByDate = filteredByTab.filter(item => {
    if (dateRange === 'all') return true;
    const d = new Date(item.timestamp);
    const now = new Date();
    if (dateRange === 'today' && d.toDateString() !== now.toDateString()) return false;
    if (dateRange === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo;
    }
    if (dateRange === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const { currentPage, setCurrentPage, paginatedData, totalItems, pageSize } = useRegistryFilter({
    data: filteredByDate,
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
    const csvContent = [headers, ...data.map(i => [
      new Date(i.timestamp).toISOString(), i.user_name, i.user_email, i.event_type, i.context, i.ip, `${i.device} • ${i.browser}`, i.status, i.user_role
    ])].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dntrng_audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Export Complete" });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <TabsList className="bg-transparent h-10">
              {['all', 'access', 'views', 'nav'].map(t => (
                <TabsTrigger key={t} value={t} className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex bg-slate-50 dark:bg-slate-800 border rounded-2xl p-1 gap-1">
            {['today', 'week', 'all'].map(r => (
              <button key={r} onClick={() => setDateRange(r)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all", dateRange === r ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}>{r}</button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Filter identity or IP..." value={displaySearch} onChange={(e) => setDisplaySearch(e.target.value)} className="pl-11 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-bold text-xs" />
          </div>
        </div>
        <Button onClick={handleExportCSV} className="rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest bg-slate-900 dark:bg-primary text-white shadow-xl hover:scale-[1.02] transition-all"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-transparent border-none">
              {['Timestamp', 'Identity Node', 'Event', 'Context / Page', 'IP Address', 'Platform', 'Role'].map((h, i) => (
                <TableHead key={h} className={cn("px-10 py-6 font-black uppercase text-[9px] tracking-widest text-slate-400", i === 4 && "text-center", i === 6 && "text-right")}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, i) => (
              <React.Fragment key={i}>
                <AuditTableRow item={item} isExpanded={expandedRows.has(i)} onToggle={() => toggleRow(i)} onCopyIP={(ip) => copyToClipboard(ip, "IP Address")} />
                {expandedRows.has(i) && <AuditDetailView item={item} onClose={() => toggleRow(i)} />}
              </React.Fragment>
            ))}
            {!loading && totalItems === 0 && (
              <TableRow><TableCell colSpan={7} className="py-40 text-center"><div className="flex flex-col items-center gap-6 opacity-20"><History className="w-16 h-16" /><h3 className="text-2xl font-black uppercase tracking-tight">Timeline Empty</h3></div></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
}
