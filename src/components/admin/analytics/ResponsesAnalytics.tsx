"use client";

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { ResponseStats } from '@/lib/analytics-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ResponsesAnalyticsProps {
  stats: ResponseStats;
}

export default function ResponsesAnalytics({ stats }: ResponsesAnalyticsProps) {
  // Performance: Limit Precision chart to top 10 modules for faster rendering
  const topPerformanceData = useMemo(() => {
    return stats.testPerformanceData.slice(0, 10);
  }, [stats.testPerformanceData]);

  const truncate = (str: string, max: number = 15) => {
    return str.length > max ? str.substring(0, max) + "..." : str;
  };

  const getEfficiencyColor = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes("LV1")) return "#22C55E";
    if (n.includes("LV2")) return "#3B5BDB";
    if (n.includes("LV3")) return "#7C3AED";
    return "#1a2340";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chart 1: Performance Distribution */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem] border dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
          <h2 className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Grade Distribution</span>
          </h2>
          <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Frequency of results per tier</CardDescription>
        </CardHeader>
        <CardContent className="pt-10 h-[350px]">
          <ErrorBoundary>
            <div 
              className="w-full h-full" 
              role="img" 
              aria-label="Grade distribution chart showing counts for Excellent, Pass and Fail categories"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gradeData} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" aria-hidden="true" />
                  <XAxis type="number" hide aria-hidden="true" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={140} 
                    tick={{ fontSize: 11, fontWeight: 800, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                    {stats.gradeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Chart 2: Module Efficiency */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem] border dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
          <h2 className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Module Precision</span>
          </h2>
          <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Average score per assessment module (Top 10)</CardDescription>
        </CardHeader>
        <CardContent className="pt-10 h-[350px]">
          <ErrorBoundary>
            <div 
              className="w-full h-full" 
              role="img" 
              aria-label="Bar chart showing average score per assessment module"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPerformanceData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" aria-hidden="true" />
                  <XAxis 
                    dataKey="name" 
                    tickFormatter={(val) => truncate(val, 12)}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Mean Score']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="avg" radius={[12, 12, 0, 0]} barSize={32}>
                    {topPerformanceData.map((entry, i) => (
                      <Cell key={i} fill={getEfficiencyColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
