"use client";

import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api-config';
import { AILoader } from '@/components/ui/ai-loader';
import { trackEvent } from '@/lib/tracker';

// Organized Sub-Components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileCharts } from '@/components/profile/ProfileCharts';
import { ProfileHistory } from '@/components/profile/ProfileHistory';

/**
 * DNTRNG™ STUDENT TERMINAL (PROFILE)
 * 
 * Acting as a container component for identity analytics and interaction history.
 */
export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    trackEvent('page_view_profile');
  }, []);

  const { data: resultsData, isLoading: resultsLoading } = useSWR(
    user?.email ? `results-${user.email}` : null,
    async () => {
      if (!API_URL) return { responses: [], tests: [] };
      const [respRes, testsRes] = await Promise.all([
        fetch(`${API_URL}?action=getResponses`),
        fetch(`${API_URL}?action=getTests`)
      ]);
      const respData = await respRes.json();
      const testsData = await testsRes.json();
      
      const userEmail = user?.email?.toLowerCase() || '';
      const userResponses = (Array.isArray(respData) ? respData : [])
        .filter((r: any) => (r['User Email'] || '').toLowerCase() === userEmail)
        .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
        
      return { 
        responses: userResponses, 
        tests: Array.isArray(testsData) ? testsData : [] 
      };
    }
  );

  const responses = resultsData?.responses || [];
  const tests = resultsData?.tests || [];

  const stats = useMemo(() => {
    if (responses.length === 0) return { taken: 0, best: 0, perfect: 0, avg: 0 };
    
    let totalScore = 0;
    let totalPossible = 0;
    let perfectCount = 0;
    const percentages = responses.map(r => {
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      if (score === total && total > 0) perfectCount++;
      totalScore += score;
      totalPossible += total;
      return (score / total) * 100;
    });

    return {
      taken: responses.length,
      best: Math.round(Math.max(...percentages)),
      perfect: perfectCount,
      avg: Math.round((totalScore / (totalPossible || 1)) * 100)
    };
  }, [responses]);

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
    
    if (notTaken.length > 0) {
      return notTaken.slice(0, 3);
    }

    const threshold = Number(settings.default_pass_threshold || '70');
    const failedIds = new Set(
      responses
        .filter(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100 < threshold)
        .map(r => String(r['Test ID']))
    );
    
    return tests.filter(t => failedIds.has(String(t.id))).slice(0, 3);
  }, [tests, responses, settings.default_pass_threshold]);

  if (authLoading || resultsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AILoader />
      </div>
    );
  }

  const hasHistory = responses.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 pb-32">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
        <ProfileHeader logout={logout} router={router} />
        
        <ProfileIdentity user={user} stats={stats} hasHistory={hasHistory} />
        
        <ProfileStats stats={stats} hasHistory={hasHistory} />

        <ProfileCharts chartData={chartData} recommendations={recommendations} hasHistory={hasHistory} />

        <ProfileHistory responses={responses} settings={settings} hasHistory={hasHistory} />
      </div>
    </div>
  );
}
