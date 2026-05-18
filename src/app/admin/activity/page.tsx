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

export default function AdminActivityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const lastTracked = useRef<string | null>(null);
  const [displaySearch, setDisplaySearch] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'access' | 'views' | 'nav'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // REGISTRY HANDSHAKE: Fetch high-capacity slices (2000 records)
  const { data: events, isLoading: eventsLoading, mutate: mutateEvents } = useSWR('/api/proxy/admin/events?limit=2000');
  const { data: logins, isLoading: loginsLoading, mutate: mutateLogins } = useSWR('/api/proxy/admin/activity?limit=2000');

  useEffect(() => {
    const key = 'page_view_admin_activity' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view', { details: 'Unified System Activity Hub' });
  }, []);

  const refreshAll = () => {
    mutateEvents();
    mutateLogins();
    toast({ title: "Registry Synchronized", description: "All telemetry nodes updated." });
  };

  /**
   * DATA NORMALIZATION PROTOCOL v2.0
   * Standardizes records from multiple registry nodes for the Unified Audit Hub.
   */
  const unifiedData = useMemo(() => {
    const normalizedEvents = (Array.isArray(events) ? events : []).map(e => ({
      timestamp: e.timestamp,
      user_name: e.user_name || 'Anonymous',
      user_email: e.user_id || 'N/A',
      user_role: e.user_role || 'user',
      event_type: e.event_type,
      context: e.page || e.test_name || 'N/A',
      ip: e.ip || e.details?.ip || 'N/A',
      device: e.device || 'N/A',
      browser: e.browser || 'N/A',
      status: 'LOGGED',
      details: e.details,
      source: 'telemetry'
    }));

    const normalizedLogins = (Array.isArray(logins) ? logins : []).map(l => ({
      timestamp: l.Timestamp,
      user_name: l['User Name'] || 'Unknown',
      user_email: l['User Email'] || 'N/A',
      user_role: l.Role || 'admin',
      event_type: l.Event,
      context: 'Access Gate',
      ip: l['IP Address'] || 'N/A',
      device: l['Device'] || 'N/A',
      browser: l.Browser || 'N/A',
      status: 'VERIFIED',
      details: { raw: l },
      source: 'activity'
    }));

    return [...normalizedEvents, ...normalizedLogins].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events, logins]);

  const filteredData = useMemo(() => {
    return unifiedData.filter(item => {
      const searchStr = displaySearch.toLowerCase();
      const matchesSearch = 
        item.user_name.toLowerCase().includes(searchStr) ||
        item.user_email.toLowerCase().includes(searchStr) ||
        item.event_type.toLowerCase().includes(searchStr) ||
        item.ip.toLowerCase().includes(searchStr) ||
        item.context.toLowerCase().includes(searchStr);

      if (!matchesSearch) return false;

      if (activeTab === 'access') {
        const types = ['login', 'logout', 'daily_key_failure', 'auth_denied'];
        if (!types.includes(item.event_type.toLowerCase())) return false;
      }
      if (activeTab === 'views') {
        if (item.event_type.toLowerCase() !== 'page_view') return false;
      }
      if (activeTab === 'nav') {
        if (!item.event_type.toLowerCase().includes('navigation') && !item.event_type.toLowerCase().includes('click')) return false;
      }

      if (dateRange !== 'all') {
        const d = new Date(item.timestamp);
        const now = new Date();
        if (dateRange === 'today' && d.toDateString() !== now.toDateString()) return false;
        if (dateRange === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (d < sevenDaysAgo) return false;
        }
        if (dateRange === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [unifiedData, displaySearch, activeTab, dateRange]);

  const stats = useMemo(() => {
    const now = new Date().toDateString();
    return {
      total: filteredData.length,
      uniqueUsers: new Set(filteredData.map(d => d.user_email)).size,
      loginsToday: filteredData.filter(d => d.event_type.toLowerCase() === 'login' && new Date(d.timestamp).toDateString() === now).length,
      navEvents: filteredData.filter(d => d.event_type.toLowerCase().includes('page')).length
    };
  }, [filteredData]);

  if ((eventsLoading || loginsLoading) && unifiedData.length === 0) {
    return <div className="py-40"><AILoader messages={["Synchronizing Telemetry Nodes...", "Analyzing Forensic Timeline..."]} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Activity</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Unified Forensic Audit & Site Telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={refreshAll} className="rounded-full h-12 w-12 border-2">
            <RefreshCcw className={cn("w-4 h-4", (eventsLoading || loginsLoading) && "animate-spin")} />
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
        <StatNode icon={MousePointer2} label="Nav Pulses" value={stats.navEvents} color="purple" />
        <StatNode icon={Calendar} label="Active Period" value={dateRange === 'all' ? 'Historical' : dateRange.toUpperCase()} color="amber" />
      </div>

      <UnifiedAuditTerminal 
        data={filteredData}
        loading={eventsLoading || loginsLoading}
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
