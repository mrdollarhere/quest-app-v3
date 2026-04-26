"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Activity, 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  User, 
  RefreshCcw,
  Clock,
  ExternalLink,
  ChevronDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { Pagination } from './Pagination';

interface EventsTabProps {
  events: any[];
  loading?: boolean;
  onRefresh: () => void;
}

export function EventsTab({ events, loading, onRefresh }: EventsTabProps) {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (idx: number) => {
    const next = new Set(expandedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedRows(next);
  };

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    events.forEach(e => types.add(e.event_type));
    return Array.from(types).sort();
  }, [events]);

  const filteredByDate = useMemo(() => {
    if (dateFilter === 'all') return events;
    const now = new Date();
    return events.filter(e => {
      const d = new Date(e.timestamp);
      if (dateFilter === 'today') return d.toDateString() === now.toDateString();
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return d >= monthAgo;
      }
      return true;
    });
  }, [events, dateFilter]);

  const filteredByType = useMemo(() => {
    if (eventTypeFilter === 'all') return filteredByDate;
    return filteredByDate.filter(e => e.event_type === eventTypeFilter);
  }, [filteredByDate, eventTypeFilter]);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: filteredByType,
    searchFields: (e) => [
      String(e.user_name || ''),
      String(e.user_id || ''),
      String(e.event_type || ''),
      String(e.page || ''),
      String(e.test_id || ''),
      String(e.test_name || '')
    ],
    pageSize: 20,
    initialSort: { key: 'timestamp', direction: 'desc' }
  });

  const summary = useMemo(() => {
    const nowStr = new Date().toDateString();
    const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === nowStr);
    const uniqueUsersToday = new Set(todayEvents.map(e => e.user_id)).size;
    const startsToday = todayEvents.filter(e => e.event_type === 'quiz_start').length;
    const completionsToday = todayEvents.filter(e => e.event_type === 'quiz_complete').length;

    return {
      totalToday: todayEvents.length,
      usersToday: uniqueUsersToday,
      startsToday,
      completionsToday
    };
  }, [events]);

  const renderContext = (e: any) => {
    let details: any = null;
    try {
      details = typeof e.details === 'string' ? JSON.parse(e.details) : e.details;
    } catch (err) {}

    const type = e.event_type;

    if (type === 'admin_test_edit') {
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="text-[#1a2340] font-bold truncate">Test: {e.test_name || e.test_id}</span>
          <span className="text-[11px] text-slate-500 truncate">Changed: {details?.changed_fields?.join(', ') || 'metadata'}</span>
        </div>
      );
    }

    if (type.startsWith('admin_question')) {
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="text-[#1a2340] font-bold truncate">Test: {e.test_name || e.test_id}</span>
          <span className="text-[11px] text-slate-500 truncate italic">{(details?.question_type || 'Node').replace('_', ' ')}: {details?.question_preview}</span>
        </div>
      );
    }

    if (type === 'quiz_submit') {
      return (
        <div className="flex flex-col max-w-[300px]">
          <span className="text-[#1a2340] font-bold truncate">{e.test_name || e.test_id}</span>
          <span className="text-[11px] text-slate-500 truncate">
            Score: {details?.score_percent}% • {details?.correct}/{details?.total} • {Math.floor(details?.time_taken_seconds / 60)}m {details?.time_taken_seconds % 60}s
          </span>
        </div>
      );
    }

    return <span className="text-slate-500 font-medium truncate max-w-[300px]">{e.page}</span>;
  };

  const formatDetails = (details: any) => {
    if (!details) return <p className="text-[10px] text-slate-400 italic">No additional registry data.</p>;
    let data = details;
    try {
      if (typeof details === 'string') data = JSON.parse(details);
    } catch (e) {}

    if (typeof data !== 'object' || data === null) {
      return <p className="text-xs text-slate-600">{String(data)}</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex gap-4 text-[11px] py-1 border-b border-slate-100 last:border-none">
            <span className="font-black uppercase tracking-widest text-slate-400 min-w-[140px]">{key.replace(/_/g, ' ')}:</span>
            <span className="text-slate-700 font-bold truncate">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'Session', 'User', 'Role', 'Event', 'Page', 'Test', 'Question', 'Score', 'Details', 'Device', 'Browser'];
    const rows = filteredByType.map(e => [
      e.timestamp,
      e.session_id,
      e.user_name,
      e.user_role,
      e.event_type,
      e.page,
      e.test_id || '',
      e.question_id || '',
      e.score || '',
      e.details,
      e.device,
      e.browser
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DNTRNG_Events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventBadge = (type: string) => {
    let classes = "bg-slate-50 text-slate-500 border-slate-100";
    if (type.startsWith('quiz')) classes = "bg-blue-50 text-blue-600 border-blue-100";
    else if (type.startsWith('admin')) classes = "bg-purple-50 text-purple-600 border-purple-100";
    else if (type.includes('login') || type.includes('logout')) classes = "bg-emerald-50 text-emerald-600 border-emerald-100";
    else if (type.includes('certificate')) classes = "bg-amber-50 text-amber-600 border-amber-100";

    return (
      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-sm", classes)}>
        {type.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard label="Total Events Today" value={summary.totalToday} icon={Activity} />
        <SummaryCard label="Unique Users Today" value={summary.usersToday} icon={User} />
        <SummaryCard label="Quizzes Started" value={summary.startsToday} icon={Clock} />
        <SummaryCard label="Quizzes Completed" value={summary.completionsToday} icon={ExternalLink} />
      </div>

      {/* Filters Row */}
      <Card className="border-none shadow-sm bg-white p-6 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-full border">
            {['today', 'week', 'month', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  dateFilter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="h-10 px-4 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Events</option>
            {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>

          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search user or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-10 rounded-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-bold text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-11 w-11">
            <RefreshCcw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin text-primary")} />
          </Button>
          <Button onClick={handleExport} className="rounded-full h-11 px-6 font-black uppercase text-[10px] tracking-widest gap-2 bg-slate-900 shadow-xl">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </Card>

      {/* Events Table */}
      <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-transparent border-none">
                <TableHead className="px-10 py-5 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Timestamp</TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Identity</TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Event</TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Context</TableHead>
                <TableHead className="px-10 text-right font-black uppercase text-[9px] tracking-[0.2em] text-slate-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((e, i) => {
                const isExpanded = expandedRows.has(i);
                return (
                  <React.Fragment key={i}>
                    <TableRow className={cn(
                      "hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-none cursor-pointer group",
                      isExpanded && "bg-slate-50/50"
                    )} onClick={() => toggleRow(i)}>
                      <TableCell className="px-10 py-5 font-mono text-[10px] text-slate-400">
                        {format(new Date(e.timestamp), 'HH:mm:ss')}
                        <span className="block text-[8px] opacity-60 uppercase">{format(new Date(e.timestamp), 'MMM dd, yyyy')}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-xs uppercase">{e.user_name}</span>
                          <span className="text-[9px] font-bold text-slate-400">{e.user_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getEventBadge(e.event_type)}</TableCell>
                      <TableCell>{renderContext(e)}</TableCell>
                      <TableCell className="px-10 text-right">
                        <div className={cn(
                          "p-2 rounded-full border border-slate-200 text-slate-400 transition-all duration-300 group-hover:border-primary group-hover:text-primary inline-flex",
                          isExpanded && "rotate-180 bg-primary text-white border-primary"
                        )}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-slate-50/30 border-b border-slate-100">
                        <TableCell colSpan={5} className="p-8 px-12">
                          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-inner space-y-6">
                            <div className="flex items-center gap-3">
                              <Info className="w-4 h-4 text-primary" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Full Diagnostic Details</h4>
                            </div>
                            <div className="space-y-4">
                              {formatDetails(e.details)}
                              
                              <div className="pt-4 mt-4 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <DetailMini label="Device" value={e.device} />
                                <DetailMini label="Browser" value={e.browser} />
                                <DetailMini label="Session" value={e.session_id} />
                                <DetailMini label="Role" value={e.user_role} />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                  {totalItems === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-32 text-center opacity-30">
                        <Activity className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Registry Clean — No Matching Events</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
            </CardContent>
          </Card>
        </div>
      );
}

function DetailMini({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{label}</p>
      <p className="text-[10px] font-bold text-slate-500 truncate">{value || 'N/A'}</p>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-6 flex items-center gap-6 rounded-[2rem]">
      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      </div>
    </Card>
  );
}
