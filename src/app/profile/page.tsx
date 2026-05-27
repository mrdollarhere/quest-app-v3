/**
 * ProfilePage.tsx
 * 
 * Purpose: Student terminal for identity analytics and interaction history.
 * Updated: v19.7.0 - Optimized data stream using server-side stats retrieval.
 */

"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useRouter } from 'next/navigation';
import { AILoader } from '@/components/ui/ai-loader';
import { trackEvent } from '@/lib/tracker';
import { BackToTop } from '@/components/BackToTop';
import { SiteFooter } from '@/components/SiteFooter';

// Organized Sub-Components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileCharts } from '@/components/profile/ProfileCharts';
import { ProfileHistory } from '@/components/profile/ProfileHistory';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const lastTracked = useRef<string | null>(null);

  // SECURE ACCESS PROTOCOL: Redirect unauthenticated nodes to entry gateway
  useEffect(() => {
    if (!authLoading && !user) {
      const fullPath = window.location.pathname + window.location.search;
      router.push(`/login?returnTo=${encodeURIComponent(fullPath)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const key = 'page_view_profile' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view_profile');
  }, []);

  const { data: resultsData, isLoading: resultsLoading } = useSWR(
    user?.email ? `results-stream-${user.email}` : null,
    async () => {
      // OPTIMIZED STREAM: Fetch stats (metrics) and full responses (history) separately
      const [statsRes, respRes, testsRes] = await Promise.all([
        fetch('/api/proxy/profile/stats'),
        fetch('/api/proxy/responses'),
        fetch('/api/proxy/tests')
      ]);
      
      const stats = await statsRes.json();
      const respData = await respRes.json();
      const testsData = await testsRes.json();
      
      const userEmail = user?.email?.toLowerCase().trim() || '';
      const userResponses = (Array.isArray(respData) ? respData : [])
        .filter((r: any) => (String(r['User Email'] || '').toLowerCase().trim()) === userEmail)
        .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
        
      return { 
        stats: stats || { testsTaken: 0, bestScore: 0, perfectScores: 0 },
        responses: userResponses, 
        tests: Array.isArray(testsData) ? testsData : [] 
      };
    }
  );

  const statsNode = resultsData?.stats || { testsTaken: 0, bestScore: 0, perfectScores: 0 };
  const responses = resultsData?.responses || [];
  const tests = resultsData?.tests || [];

  // Local calculation for average (not provided by simple stats node)
  const stats = useMemo(() => {
    if (responses.length === 0) return { taken: 0, best: 0, perfect: 0, avg: 0 };
    
    let totalScore = 0;
    let totalPossible = 0;
    responses.forEach(r => {
      totalScore += Number(r.Score) || 0;
      totalPossible += Number(r.Total) || 1;
    });

    return {
      taken: statsNode.testsTaken || responses.length,
      best: statsNode.bestScore || 0,
      perfect: statsNode.perfectScores || 0,
      avg: Math.round((totalScore / (totalPossible || 1)) * 100)
    };
  }, [responses, statsNode]);

  const chartData = useMemo(() => {
    return [...responses]
      .slice(0, 10)
      .reverse()
      .map((r, i) => ({
        name: i + 1,
        score: Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100)
      }));
  }, [responses]);

  const recommendations = useMemo(() => {
    if (tests.length === 0) return [];
    
    if (responses.length === 0) {
      return tests
        .filter(t => String(t.difficulty || "").toLowerCase() === 'beginner' || String(t.difficulty || "").toLowerCase() === 'easy')
        .slice(0, 3);
    }

    const takenIds = new Set(responses.map(r => String(r['Test ID'])));
    const notTaken = tests.filter(t => !takenIds.has(String(t.id)));
    
    if (notTaken.length > 0) return notTaken.slice(0, 3);

    const threshold = Number(settings.default_pass_threshold || '70');
    const failedIds = new Set(
      responses
        .filter(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100 < threshold)
        .map(r => String(r['Test ID']))
    );
    
    return tests.filter(t => failedIds.has(String(t.id))).slice(0, 3);
  }, [tests, responses, settings.default_pass_threshold]);

  if (authLoading || resultsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><AILoader showBrand={true} /></div>;
  }

  if (!user) return null;

  const hasHistory = responses.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col transition-all duration-300">
      <div className="flex-1 py-12 px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
          <ProfileHeader user={user} logout={logout} router={router} />
          <ProfileIdentity user={user} stats={stats} hasHistory={hasHistory} />
          <ProfileStats stats={stats} hasHistory={hasHistory} />
          <ProfileCharts chartData={chartData} recommendations={recommendations} hasHistory={hasHistory} />
          <ProfileHistory responses={responses} settings={settings} hasHistory={hasHistory} />
        </div>
      </div>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
