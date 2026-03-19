"use client";

import React, { useMemo } from 'react';
import { 
  LayoutGrid, 
  Users as UsersIcon, 
  TrendingUp, 
  Activity, 
  History, 
  ChevronRight, 
  Plus, 
  Zap, 
  RefreshCcw,
  Database,
  Clock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { AdminTab } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';

interface OverviewTabProps {
  data: { tests: any[], users: any[], responses: any[] };
  lastSync: Date | null;
  onNewTest: () => void; // This remains for backwards compat but we'll prefer router
  onManageContent: () => void;
  onSync: () => void;
  onSeed: () => void;
  setActiveTab: (tab: AdminTab) => void;
}

export function OverviewTab({ data, lastSync, onNewTest, onManageContent, onSync, onSeed, setActiveTab }: OverviewTabProps) {
  const router = useRouter();

  const chartData = useMemo(() => {
    if (!data.responses.length) return [];
    const counts: Record<string, number> = {};
    data.responses.forEach(r => {
      const date = new Date(r.Timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).reverse().slice(-7);
  }, [data.responses]);

  const avgScore = useMemo(() => {
    if (data.responses.length === 0) return '0%';
    const totalPossible = data.responses.reduce((acc, r) => acc + (Number(r.Total) || 1), 0);
    const totalEarned = data.responses.reduce((acc, r) => acc + (Number(r.Score) || 0), 0);
    return `${Math.round((totalEarned / totalPossible) * 100)}%`;
  }, [data.responses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">System Online</span>
          </div>
          {lastSync && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border shadow-sm">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Last Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={LayoutGrid} label="Assessments" value={data.tests.length} color="blue" />
        <StatCard icon={UsersIcon} label="Students" value={data.users.length} color="green" />
        <StatCard icon={TrendingUp} label="Submissions" value={data.responses.length} color="purple" />
        <StatCard icon={Activity} label="Avg. Score" value={avgScore} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-900">Submission Trends</CardTitle>
                <CardDescription>Activity overview for the current week</CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-bold">LIVE ACTIVITY</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-10 h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                <History className="w-12 h-12 opacity-20" />
                <p className="font-bold">No recent activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-black text-slate-900">Recent Activity</CardTitle>
            <CardDescription>Latest test completions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {data.responses.slice(0, 6).map((resp, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs",
                    (Number(resp.Score) / Number(resp.Total)) >= 0.7 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {resp.Score}/{resp.Total}
                  </div>
                  <div className="flex-1 min-w-0 text-slate-700">
                    <p className="font-bold text-sm truncate">{resp['Test ID']}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{new Date(resp.Timestamp).toLocaleString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="ghost" className="w-full font-bold text-xs rounded-xl" onClick={() => setActiveTab('responses')}>
              View Full History
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickActionCard title="Create Test" description="Add assessment sheet" icon={Plus} onClick={() => router.push('/admin/tests/new')} theme="primary" />
        <QuickActionCard title="Manage Content" description="Edit question banks" icon={Zap} onClick={onManageContent} theme="dark" />
        <QuickActionCard title="Seed Demo" description="Populate example data" icon={Database} onClick={onSeed} theme="accent" />
        <QuickActionCard title="Sync Cloud" description="Fetch latest Sheet data" icon={RefreshCcw} onClick={onSync} theme="light" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
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
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick, theme }: any) {
  const themes: Record<string, string> = {
    primary: "bg-gradient-to-br from-primary to-blue-600 text-white",
    dark: "bg-slate-900 text-white",
    accent: "bg-accent text-white shadow-lg shadow-accent/20",
    light: "bg-white border-2 border-slate-100 text-slate-900"
  };
  return (
    <Card className={cn("border-none shadow-sm cursor-pointer hover:scale-[1.02] transition-transform", themes[theme])} onClick={onClick}>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", (theme === 'light') ? 'bg-slate-100' : 'bg-white/20')}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="font-black text-base lg:text-lg">{title}</p>
          <p className={cn("text-[10px] font-medium opacity-80", theme === 'light' && 'text-muted-foreground')}>
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
