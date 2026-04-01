"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from "lucide-react";
import { API_URL } from '@/lib/api-config';

interface BenchmarkingSectionProps {
  testId?: string;
  percentage: number;
  enabled?: boolean;
}

export function BenchmarkingSection({ testId, percentage, enabled = true }: BenchmarkingSectionProps) {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optimization Protocol: Skip network fetch if benchmarking is disabled
    if (!enabled || !testId || !API_URL) return;
    
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}?action=getResponses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const testResponses = data.filter(r => String(r['Test ID']) === String(testId));
          if (testResponses.length > 0) {
            const currentScorePct = percentage;
            const scores = testResponses.map(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100);
            const lowerScores = scores.filter(s => s < currentScorePct).length;
            const calculatedPercentile = Math.round((lowerScores / scores.length) * 100);
            setPercentile(calculatedPercentile);
          } else {
            setPercentile(100);
          }
        }
      } catch (e) {
        console.error("Comparison fetch failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [testId, percentage, enabled]);

  // UI Enforcement: Hide component if disabled or loading failed to find data
  if (!enabled || percentile === null && !loading) return null;

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 mb-10">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Comparison Registry...</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6 mb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Global Benchmarking</p>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">System Percentile: <span className="text-primary">{percentile}%</span></p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Mastery</span>
        </div>
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-white dark:border-slate-600">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentile}%` }}
          />
        </div>
      </div>
    </div>
  );
}
