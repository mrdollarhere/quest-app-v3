"use client";

import React from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api-config';
import { EventsTab } from '@/components/admin/EventsTab';
import { AILoader } from '@/components/ui/ai-loader';
import { Activity } from 'lucide-react';
import { trackEvent } from '@/lib/tracker';
import { useEffect } from 'react';

export default function AdminEventsPage() {
  const { data: events, isLoading, mutate } = useSWR(
    API_URL ? `${API_URL}?action=getEvents&limit=1000` : null
  );

  useEffect(() => {
    trackEvent('page_view', { details: 'Admin Events Terminal' });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Feed</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Comprehensive System Telemetry</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-xl font-black text-slate-900 dark:text-white">{events?.length || 0}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cached</span>
        </div>
      </div>
      
      {isLoading && (!events || events.length === 0) ? (
        <div className="py-40">
          <AILoader messages={["Accessing Event Registry...", "Synchronizing Telemetry Nodes..."]} />
        </div>
      ) : (
        <EventsTab events={Array.isArray(events) ? events : []} loading={isLoading} onRefresh={() => mutate()} />
      )}
    </div>
  );
}
