"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { 
  Activity, 
  Users, 
  LogIn, 
  RefreshCcw,
  Calendar,
  MousePointer2
} from 'lucide-react';
import { UnifiedAuditTerminal } from '@/components/admin/audit/UnifiedAuditTerminal';
import { AILoader } from '@/components/ui/ai-loader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { trackEvent } from '@/lib/tracker';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * SYSTEM ACTIVITY COMMAND CENTER
 * 
 * Orchestrates the unified forensic audit terminal.
 * Hydrates from a single consolidated registry node: System_Activity.
 */
export default function AdminActivityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const lastTracked = useRef<string | null>(null);
  const [displaySearch, setDisplaySearch] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'access' | 'views' | 'nav'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // REGISTRY HANDSHAKE: Fetch unified telemetry stream
  const { data: activityLogs, isLoading, mutate } = useSWR('/api/proxy/admin/activity?limit=2000');

  useEffect(() => {
    const key = 'page_view_admin_activity' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view', { details: 'Unified System Activity Hub' });
  }, []);

  const refreshAll = () => {
    mutate();
    toast({ title: "Registry Synchronized", description: "Consolidated telemetry node updated." });
  };

  /**
   * DATA NORMALIZATION PROTOCOL v3.1
   * Standardizes records from the unified System_Activity registry.
   * Includes SAFE PARSING for inconsistent detail fields.
   */
  const unifiedData = useMemo(() => {
    if (!Array.isArray(activityLogs)) return [];

    return activityLogs.map(log => {
      // SAFE PARSING PROTOCOL: Handle plain strings or JSON objects
      let parsedDetails = {};
      if (log.details) {
        if (typeof log.details === 'string') {
          const trimmed = log.details.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              parsedDetails = JSON.parse(trimmed);
            } catch (e) {
              parsedDetails = { info: trimmed };
            }
          } else {
            parsedDetails = { info: trimmed };
          }
        } else {
          parsedDetails = log.details;
        }
      }

      return {
        timestamp: log.timestamp || log.Timestamp,
        user_name: log.user_name || 'Anonymous',
        user_email: log.user_email || 'N/A',
        user_role: log.user_role || 'user',
        event_type: log.event_type || 'SYSTEM',
        context: log.context || 'N/A',
        ip: log.ip_address || log.ip || 'N/A',
        device: log.device || 'N/A',
        browser: log.browser || 'N/A',
        status: log.status || 'VERIFIED',
        details: parsedDetails,
        source: 'unified'
      };
    }).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activityLogs]);

  const stats = useMemo(() => {
    const now = new Date().toDateString();
    return {
      total: unifiedData.length,
      uniqueUsers: new Set(unifiedData.map(d => d.user_email)).size,
      loginsToday: unifiedData.filter(d => 
        (d.event_type.toLowerCase().includes('login')) && 
        new Date(d.timestamp).toDateString() === now
      ).length,
      navEvents: unifiedData.filter(d => 
        d.event_type.toLowerCase().includes('page') || 
        d.event_type.toLowerCase().includes('nav')
      ).length
    };
  }, [unifiedData]);

  if (isLoading && unifiedData.length === 0) {
    return <div className="py-40"><AILoader messages={["Accessing Unified Registry...", "Synchronizing Telemetry Stream..."]} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Activity</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Consolidated Forensic Audit Terminal</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={refreshAll} className="rounded-full h-12 w-12 border-2">
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{stats.total}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pulses</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatNode icon={Users} label="Identity Nodes" value={stats.uniqueUsers} color="blue" />
        <StatNode icon={LogIn} label="Logins Today" value={stats.loginsToday} color="emerald" />
        <StatNode icon={MousePointer2} label="Interaction Pulses" value={stats.navEvents} color="purple" />
        <StatNode icon={Calendar} label="Active Period" value={dateRange === 'all' ? 'Historical' : dateRange.toUpperCase()} color="amber" />
      </div>

      <UnifiedAuditTerminal 
        data={unifiedData}
        loading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dateRange={dateRange}
        setDateRange={setDateRange}
        displaySearch={displaySearch}
        setDisplaySearch={setDisplaySearch}
        onRefresh={refreshAll}
      />
    </div>
  );
}

function StatNode({ icon: Icon, label, value, color }: any) {
  const colors: any = { blue: "bg-blue-50 text-blue-600 border-blue-100", emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", purple: "bg-purple-50 text-purple-600 border-purple-100", amber: "bg-amber-50 text-amber-600 border-amber-100" };
  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center gap-5 rounded-3xl">
      <div className={cn("p-3.5 rounded-2xl border", colors[color])}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{value}</p>
      </div>
    </Card>
  );
}
