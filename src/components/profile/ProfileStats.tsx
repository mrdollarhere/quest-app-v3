"use client";

import React from 'react';
import { BookOpen, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStatsProps {
  stats: { taken: number; best: number; perfect: number };
  hasHistory: boolean;
}

export function ProfileStats({ stats, hasHistory }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard icon={BookOpen} label="Tests taken" value={stats.taken} color="blue" />
      <MetricCard icon={Star} label="Best score" value={hasHistory ? `${stats.best}%` : "--"} color="green" />
      <MetricCard icon={Trophy} label="Perfect scores" value={stats.perfect} color="purple" />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: 'blue' | 'green' | 'purple' }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-md transition-all">
      <div className={cn("p-4 rounded-2xl border-2 transition-transform group-hover:scale-110", styles[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{value}</p>
      </div>
    </div>
  );
}
