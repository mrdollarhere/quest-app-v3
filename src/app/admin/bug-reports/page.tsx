"use client";

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { 
  Bug, 
  Search, 
  RefreshCcw, 
  Clock, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Timer,
  ChevronDown,
  XCircle,
  Save,
  Loader2,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AILoader } from '@/components/ui/ai-loader';
import { useToast } from '@/hooks/use-toast';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { Pagination } from '@/components/admin/Pagination';
import { cn } from '@/lib/utils';

export default function AdminBugReportsPage() {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setUpdatingExpandedId] = useState<string | null>(null);

  const { data: reports, isLoading, mutate } = useSWR('/api/proxy/admin/bug-reports');

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    return reports.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [reports, statusFilter, categoryFilter]);

  const { searchTerm, setSearchTerm, paginatedData, totalItems, currentPage, setCurrentPage, pageSize } = useRegistryFilter({
    data: filteredData,
    searchFields: (r) => [r.user_name, r.user_email, r.description, r.category],
    pageSize: 15
  });

  const stats = useMemo(() => {
    if (!Array.isArray(reports)) return { new: 0, reviewing: 0, resolved: 0, dismissed: 0 };
    return {
      new: reports.filter(r => r.status === 'new').length,
      reviewing: reports.filter(r => r.status === 'reviewing').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length,
    };
  }, [reports]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/proxy/admin/bug-reports/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, note })
      });
      if (res.ok) {
        toast({ title: "Registry Updated" });
        mutate();
      } else { throw new Error(); }
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading && (!reports || reports.length === 0)) return <div className="py-40"><AILoader messages={["Accessing Issue Registry...", "Retrieving Bug Reports..."]} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bug Reports</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Student-submitted issue registry</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => mutate()} className="rounded-full h-12 w-12 bg-white border-2">
          <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="New" value={stats.new} color="rose" icon={AlertCircle} />
        <SummaryCard label="Reviewing" value={stats.reviewing} color="amber" icon={Timer} />
        <SummaryCard label="Resolved" value={stats.resolved} color="emerald" icon={CheckCircle2} />
        <SummaryCard label="Dismissed" value={stats.dismissed} color="slate" icon={XCircle} />
      </div>

      <Card className="border-none shadow-sm bg-white p-6 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-11 rounded-xl font-bold border-none ring-1 ring-slate-100 bg-slate-50 text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2"><Filter className="w-3 h-3 text-primary" /><SelectValue placeholder="Status" /></div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search student or issue..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-11 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-xs" />
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-transparent border-none">
              <TableHead className="px-10 py-5 font-black uppercase text-[9px] tracking-widest text-slate-400">Timestamp</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Identity</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Category</TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="px-10 text-right font-black uppercase text-[9px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((report) => (
              <React.Fragment key={report.id}>
                <TableRow className="group hover:bg-slate-50/50 border-b border-slate-50 last:border-none cursor-pointer" onClick={() => setUpdatingExpandedId(expandedId === report.id ? null : report.id)}>
                  <TableCell className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900">{new Date(report.timestamp).toLocaleDateString()}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-primary uppercase">{report.user_name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="font-black text-xs uppercase">{report.user_name}</span>
                        <span className="text-[10px] font-medium text-slate-400">{report.user_email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border-slate-200 text-slate-500 bg-slate-50">
                      {report.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-100"><ChevronDown className={cn("w-4 h-4 transition-transform", expandedId === report.id && "rotate-180")} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedId === report.id && (
                  <TableRow className="bg-slate-50/30 border-b border-slate-100">
                    <TableCell colSpan={5} className="p-8 px-12">
                      <div className="bg-white rounded-[2rem] p-8 border shadow-inner space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                          <div className="md:col-span-8 space-y-6">
                            <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Description / Problem</p><p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">{report.description}</p></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <DetailItem label="Test ID" value={report.test_id} />
                              <DetailItem label="Device" value={report.device} />
                              <DetailItem label="Browser" value={report.browser} truncate />
                              <DetailItem label="URL" value={report.page_url} truncate />
                            </div>
                          </div>
                          <div className="md:col-span-4 space-y-6 border-l pl-10 border-slate-100">
                             <div>
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Triage Protocol</p>
                               <div className="flex flex-col gap-2">
                                 {['reviewing', 'resolved', 'dismissed'].map(s => (
                                   <Button 
                                     key={s} 
                                     variant="outline" 
                                     size="sm" 
                                     disabled={report.status === s || updatingId === report.id}
                                     onClick={() => updateStatus(report.id, s, report.admin_note)}
                                     className={cn("justify-start h-10 rounded-xl font-black uppercase text-[9px] tracking-widest border-2", report.status === s && "bg-slate-900 text-white border-slate-900")}
                                   >
                                     {updatingId === report.id ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <div className={cn("w-2 h-2 rounded-full mr-2", s === 'resolved' ? 'bg-emerald-500' : s === 'reviewing' ? 'bg-amber-500' : 'bg-slate-400')} />}
                                     Mark as {s}
                                   </Button>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Internal Note</p>
                               <div className="flex gap-2">
                                 <Input 
                                   defaultValue={report.admin_note} 
                                   id={`note-${report.id}`}
                                   placeholder="Add note..." 
                                   className="h-10 rounded-xl text-xs" 
                                 />
                                 <Button 
                                   size="icon" 
                                   className="h-10 w-10 shrink-0 rounded-xl"
                                   onClick={() => {
                                     const input = document.getElementById(`note-${report.id}`) as HTMLInputElement;
                                     updateStatus(report.id, report.status, input.value);
                                   }}
                                 >
                                   <Save className="w-4 h-4" />
                                 </Button>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {totalItems === 0 && (
              <TableRow><TableCell colSpan={5} className="py-40 text-center opacity-20"><div className="flex flex-col items-center gap-4"><Bug className="w-16 h-16" /><p className="font-black uppercase text-xs tracking-widest">Registry Empty</p></div></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }: any) {
  const colors: any = { 
    rose: "bg-rose-50 text-rose-600 border-rose-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    slate: "bg-slate-50 text-slate-400 border-slate-100" 
  };
  return (
    <Card className="border-none shadow-sm bg-white p-6 flex items-center gap-5 rounded-[2rem]">
      <div className={cn("p-4 rounded-2xl border", colors[color])}><Icon className="w-5 h-5" /></div>
      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</p></div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    new: "bg-rose-500 text-white border-none",
    reviewing: "bg-amber-500 text-white border-none",
    resolved: "bg-emerald-500 text-white border-none",
    dismissed: "bg-slate-200 text-slate-600 border-none"
  };
  return <Badge className={cn("rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest", configs[status] || configs.new)}>{status}</Badge>;
}

function DetailItem({ label, value, truncate = false }: { label: string, value: string, truncate?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{label}</p>
      <p className={cn("text-[11px] font-bold text-slate-600", truncate && "truncate max-w-[150px]")} title={value}>{value || 'N/A'}</p>
    </div>
  );
}
