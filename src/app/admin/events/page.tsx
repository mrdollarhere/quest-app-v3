"use client";

import React, { useRef } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api-config';
import { EventsTab } from '@/components/admin/EventsTab';
import { AILoader } from '@/components/ui/ai-loader';
import { Activity, Sparkles, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/tracker';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminEventsPage() {
  const { data: events, isLoading, mutate } = useSWR(
    API_URL ? `${API_URL}?action=getEvents&limit=1000` : null
  );
  const { toast } = useToast();
  const [cleaning, setCleaning] = useState(false);
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const key = 'page_view_admin_events' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view', { details: 'Admin Events Terminal' });
  }, []);

  const handleCleanDuplicates = async () => {
    if (!API_URL) return;
    setCleaning(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'cleanDuplicates' })
      });
      toast({ title: "Forensic Scan Triggered", description: "Request committed to registry. Refreshing feed..." });
      setTimeout(() => {
        mutate();
        setCleaning(false);
      }, 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Scan Failure" });
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Site Events</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Comprehensive System Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleCleanDuplicates} 
            disabled={cleaning || isLoading}
            className="rounded-full h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 bg-white dark:bg-slate-900 border-2"
          >
            {cleaning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            Purge Duplicates
          </Button>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xl font-black text-slate-900 dark:text-white">{events?.length || 0}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cached</span>
          </div>
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