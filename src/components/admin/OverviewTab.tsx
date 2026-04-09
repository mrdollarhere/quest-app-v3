"use client";

import React, { useMemo } from 'react';
import { 
  LayoutGrid, 
  Users as UsersIcon, 
  TrendingUp, 
  Activity, 
  Plus, 
  Zap, 
  RefreshCcw,
  Database,
  Code2,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminTab } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { GAS_CODE } from '@/app/lib/gas-template';
import { useLanguage } from '@/context/language-context';
import { AccessKeyPanel } from './AccessKeyPanel';
import { DashboardCharts } from './DashboardCharts';

interface OverviewTabProps {
  data: { tests: any[], users: any[], responses: any[] };
  lastSync: Date | null;
  settings: Record<string, string>;
  onNewTest: () => void;
  onManageContent: () => void;
  onSync: () => void;
  onSeed: () => void;
  onSaveSetting: (key: string, value: string) => void;
  setActiveTab: (tab: AdminTab) => void;
  loading?: boolean;
}

export function OverviewTab({ data, lastSync, settings, onNewTest, onManageContent, onSync, onSeed, onSaveSetting, setActiveTab, loading }: OverviewTabProps) {
  const router = useRouter();
  const { t } = useLanguage();
  
  const avgScoreValue = useMemo(() => {
    if (data.responses.length === 0) return 0;
    const totalPossible = data.responses.reduce((acc, r) => acc + (Number(r.Total) || 1), 0);
    const totalEarned = data.responses.reduce((acc, r) => acc + (Number(r.Score) || 0), 0);
    return Math.round((totalEarned / totalPossible) * 100);
  }, [data.responses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('statusActive')}</span>
          </div>
          {lastSync && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border shadow-sm">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-slate-500 uppercase">
                {t('lastSync')}: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        <AccessKeyPanel settings={settings} lastSync={lastSync} onSaveSetting={onSaveSetting} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={LayoutGrid} label={t('totalTests')} value={data.tests.length} color="blue" />
        <StatCard icon={UsersIcon} label={t('totalStudents')} value={data.users.length} color="green" />
        <StatCard icon={TrendingUp} label={t('testResults')} value={data.responses.length} color="purple" />
        <StatCard icon={Activity} label={t('avgScore')} value={`${avgScoreValue}%`} color="orange" trend={<TrendingUp className="w-3 h-3 text-emerald-500 ml-1" />} />
      </div>

      <DashboardCharts responses={data.responses} onSeeAll={() => setActiveTab('responses')} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <QuickActionCard title={t('createTest')} icon={Plus} onClick={() => router.push('/admin/tests/new')} theme="primary" disabled={loading} />
        <QuickActionCard title={t('manageTests')} icon={Zap} onClick={onManageContent} theme="dark" disabled={loading} />
        <QuickActionCard title={t('gsCode')} icon={Code2} onClick={() => { navigator.clipboard.writeText(GAS_CODE); }} theme="accent" disabled={loading} />
        <QuickActionCard title={t('syncData')} icon={RefreshCcw} onClick={onSync} theme="light" disabled={loading} loading={loading} />
        <QuickActionCard title={t('seedData')} icon={Database} onClick={onSeed} theme="warning" disabled={loading} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600"
  };
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-4 rounded-2xl", colors[color])}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, icon: Icon, onClick, theme, disabled, loading }: any) {
  const themes: Record<string, string> = {
    primary: "bg-primary text-white",
    dark: "bg-slate-900 text-white",
    accent: "bg-accent text-white",
    light: "bg-white border-2 border-slate-100 text-slate-900",
    warning: "bg-orange-500 text-white"
  };
  return (
    <Card 
      className={cn(
        "border-none shadow-sm cursor-pointer transition-all", 
        themes[theme],
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
      )} 
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", theme === 'light' ? 'bg-slate-100' : 'bg-white/20')}>
          <Icon className={cn("w-6 h-6", loading && "animate-spin")} />
        </div>
        <p className="font-black text-base">{title}</p>
      </CardContent>
    </Card>
  );
}
