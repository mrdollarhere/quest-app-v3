"use client";

import React from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api-config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Clock, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import Link from 'next/link';

export function LiveActivityWidget() {
  const { data: events, isLoading } = useSWR(
    API_URL ? `${API_URL}?action=getEvents&limit=10` : null,
    { refreshInterval: 60000 }
  );

  const getEventColor = (type: string) => {
    if (type.startsWith('quiz')) return "bg-blue-50 text-blue-600 border-blue-100";
    if (type.startsWith('admin')) return "bg-purple-50 text-purple-600 border-purple-100";
    if (type.startsWith('page_view')) return "bg-slate-50 text-slate-500 border-slate-100";
    if (type.includes('login') || type.includes('logout')) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (type.includes('certificate')) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-slate-50 text-slate-400 border-slate-100";
  };

  return (
    <Card className="border-none shadow-sm flex flex-col bg-white overflow-hidden rounded-[2.5rem]">
      <CardHeader className="border-b bg-slate-50/50 p-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Live Activity</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Real-time engagement feed</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-10 text-center animate-pulse">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Hydrating feed...</p>
          </div>
        ) : events && Array.isArray(events) && events.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {events.map((ev, i) => (
              <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="text-xs font-black text-slate-700 truncate max-w-[120px]">{ev.user_name}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-tighter px-2 py-0 rounded-md border", getEventColor(ev.event_type))}>
                    {ev.event_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{ev.page}</span>
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tabular-nums">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center opacity-20">
            <Activity className="w-12 h-12 mx-auto mb-4" />
            <p className="font-black uppercase tracking-[0.2em] text-xs">No Events Recorded</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 bg-slate-50/30">
        <Link href="/admin/events" className="w-full">
          <Button variant="ghost" className="w-full font-black text-[10px] uppercase tracking-widest rounded-xl h-11 hover:bg-white shadow-sm">
            View All Events <ArrowRight className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
