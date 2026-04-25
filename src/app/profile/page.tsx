"use client";

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  ArrowLeft, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Clock,
  ListChecks
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { API_URL } from '@/lib/api-config';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AILoader } from '@/components/ui/ai-loader';
import { useLanguage } from '@/context/language-context';
import { trackEvent } from '@/lib/tracker';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { PerformanceGauge } from '@/components/quiz/PerformanceGauge';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    trackEvent('page_view_profile');
  }, []);

  const { data: resultsData, isLoading: resultsLoading } = useSWR(
    user?.email ? `results-${user.email}` : null,
    async () => {
      if (!API_URL) return { responses: [], tests: [] };
      const [respRes, testsRes] = await Promise.all([fetch(`${API_URL}?action=getResponses`), fetch(`${API_URL}?action=getTests`)]);
      const respData = await respRes.json();
      const testsData = await testsRes.json();
      const userEmail = user?.email?.toLowerCase() || '';
      const userResponses = (respData || []).filter((r: any) => (r['User Email'] || '').toLowerCase() === userEmail);
      return { responses: userResponses, tests: testsData || [] };
    }
  );

  const responses = resultsData?.responses || [];
  const tests = resultsData?.tests || [];

  if (authLoading || resultsLoading) return <div className="min-h-screen flex items-center justify-center"><AILoader /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/tests"><Button variant="ghost" size="sm" className="rounded-full font-bold text-slate-400 mb-2"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Library</Button></Link>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-8 border-b bg-[#f9fafb] relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-[64px] h-[64px] rounded-[12px] bg-[#1a2340] flex items-center justify-center text-white text-2xl font-bold shadow-xl">{user?.displayName?.charAt(0)}</div>
                <div>
                  <h1 className="text-[18px] font-bold text-[#1a2340] uppercase tracking-tight leading-none">{user?.displayName}</h1>
                  <p className="text-[12px] font-medium text-slate-400">{user?.email}</p>
                </div>
              </div>
              <Button onClick={() => { trackEvent('logout'); logout(); }} variant="ghost" size="icon" className="rounded-full text-slate-300"><LogOut className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Interaction Registry</h3>
            <div className="space-y-3">
              {responses.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 truncate uppercase">{r['Test ID']}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.Timestamp).toLocaleDateString()} • {r.Score}/{r.Total}</p>
                  </div>
                  <Link href={`/quiz?id=${r['Test ID']}`} onClick={() => trackEvent('quiz_retake', { test_id: r['Test ID'] })}><Button variant="outline" className="h-8 px-3 rounded-lg text-[9px] font-black uppercase">Retake <ChevronRight className="w-2.5 h-2.5 ml-1" /></Button></Link>
                </div>
              ))}
              {responses.length === 0 && (
                <div className="py-20 text-center opacity-30"><Trophy className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase text-xs">No Missions Completed</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
