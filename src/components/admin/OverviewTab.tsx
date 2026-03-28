
"use client";

import React, { useMemo, useState, useEffect } from 'react';
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
  Clock,
  Key,
  CalendarDays,
  Copy,
  Code2,
  Settings2,
  Save
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AdminTab } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { generateDailyPassword } from '@/lib/security-utils';
import { addDays, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { GAS_CODE } from '@/app/lib/gas-template';
import { useLanguage } from '@/context/language-context';

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
}

export function OverviewTab({ data, lastSync, settings, onNewTest, onManageContent, onSync, onSeed, onSaveSetting, setActiveTab }: OverviewTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isSaltDialogOpen, setIsSaltDialogOpen] = useState(false);
  const [newSalt, setNewSalt] = useState(settings.daily_key_salt || "");
  const [mounted, setMounted] = useState(false);
  
  // Optimistic local state for the protection toggle
  const [localProtectionEnabled, setLocalProtectionEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync local state when settings are loaded/updated from prop
  useEffect(() => {
    if (settings.access_key_protection_enabled !== undefined) {
      const isEnabled = String(settings.access_key_protection_enabled) !== "false";
      setLocalProtectionEnabled(isEnabled);
    }
  }, [settings.access_key_protection_enabled]);

  const protocolSalt = settings.daily_key_salt || "";
  const currentDailyKey = generateDailyPassword(undefined, protocolSalt);

  const protocolSchedule = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'MMM dd, yyyy'),
        isToday: i === 0,
        key: generateDailyPassword(date, protocolSalt)
      };
    });
  }, [protocolSalt]);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  const handleUpdateSalt = () => {
    onSaveSetting('daily_key_salt', newSalt);
    setIsSaltDialogOpen(false);
  };

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
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t('lastSync')}: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900 p-4 rounded-[1.5rem] shadow-xl border border-white/5 group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Key className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('accessKey')}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white tracking-[0.2em] font-mono leading-none">
                  {(!mounted || !lastSync) ? "••••••••" : currentDailyKey}
                </span>
                {mounted && lastSync && (
                  <button 
                    onClick={() => copyToClipboard(currentDailyKey, t('accessKey'))}
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="sm:ml-4 sm:pl-4 sm:border-l border-white/10 flex items-center gap-3">
            <Switch 
              id="protection-toggle"
              checked={localProtectionEnabled} 
              onCheckedChange={(checked) => {
                setLocalProtectionEnabled(checked);
                onSaveSetting('access_key_protection_enabled', String(checked));
              }}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="protection-toggle" className="text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer whitespace-nowrap">
              {localProtectionEnabled ? "Protected" : "Open Access"}
            </Label>
          </div>
          
          <div className="sm:ml-4 sm:pl-4 sm:border-l border-white/10 flex items-center gap-2">
            <Dialog open={isSaltDialogOpen} onOpenChange={setIsSaltDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl dark:bg-slate-900">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Configure Protocol Secret</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    This secret salt is used to generate the dynamic daily keys. Changing this will invalidate all currently distributed keys for today.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Custom Protocol Salt</Label>
                    <Input 
                      value={newSalt} 
                      onChange={(e) => setNewSalt(e.target.value)} 
                      placeholder="e.g. MY-PRIVATE-PROTOCOL-2025" 
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold"
                    />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-bold text-primary leading-relaxed">
                      Pro Tip: Use a unique, long string to ensure your Daily Access Keys are unpredictable.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleUpdateSalt}
                    className="w-full h-14 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Apply New Secret
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  {t('weeklySchedule')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl" align="end">
                <div className="bg-slate-900 p-6 text-white border-b border-white/5">
                  <h4 className="font-black uppercase tracking-tight text-lg">Key Schedule</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next 7 Days</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 max-h-[400px] overflow-y-auto">
                  {mounted && lastSync ? (
                    protocolSchedule.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-4 rounded-2xl flex items-center justify-between group transition-colors",
                          item.isToday ? "bg-primary/5 ring-1 ring-primary/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", item.isToday ? "text-primary" : "text-slate-400")}>
                            {item.isToday ? "Today" : item.date}
                          </p>
                          <p className="text-sm font-mono font-black text-slate-900 dark:text-white tracking-widest mt-0.5">{item.key}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(item.key, `${item.date} Key`)}
                          className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <RefreshCcw className="w-6 h-6 text-slate-200 animate-spin mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Keys...</p>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t dark:border-slate-800 text-center">
                  <p className="text-[9px] font-medium text-slate-400">{t('weeklyKeys')}</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={LayoutGrid} label={t('totalTests')} value={data.tests.length} color="blue" />
        <StatCard icon={UsersIcon} label={t('totalStudents')} value={data.users.length} color="green" />
        <StatCard icon={TrendingUp} label={t('testResults')} value={data.responses.length} color="purple" />
        <StatCard icon={Activity} label={t('avgScore')} value={avgScore} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">{t('activityTrend')}</CardTitle>
                <CardDescription className="dark:text-slate-400">Number of tests completed this week</CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-bold">LIVE</Badge>
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
                <p className="font-bold">No results found yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">{t('recentResults')}</CardTitle>
            <CardDescription className="dark:text-slate-400">{t('recentSubmissions')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y dark:divide-slate-800">
              {data.responses.slice(0, 6).map((resp, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs",
                    (Number(resp.Score) / Number(resp.Total)) >= 0.7 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {resp.Score}/{resp.Total}
                  </div>
                  <div className="flex-1 min-w-0 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-sm truncate">{resp['Test ID']}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{new Date(resp.Timestamp).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t dark:border-slate-800 p-4">
            <Button variant="ghost" className="w-full font-bold text-xs rounded-xl dark:hover:bg-slate-800" onClick={() => setActiveTab('responses')}>
              {t('seeAllResults')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <QuickActionCard title={t('createTest')} description="Add assessment" icon={Plus} onClick={() => router.push('/admin/tests/new')} theme="primary" />
        <QuickActionCard title={t('manageTests')} description="Edit library" icon={Zap} onClick={onManageContent} theme="dark" />
        <QuickActionCard title={t('gsCode')} description="GS Protocol v18.1" icon={Code2} onClick={() => copyToClipboard(GAS_CODE, t('gsCode'))} theme="accent" />
        <QuickActionCard title={t('syncData')} description="Refresh from Sheets" icon={RefreshCcw} onClick={onSync} theme="light" />
        <QuickActionCard title={t('seedData')} description="Initialize demo content" icon={Database} onClick={onSeed} theme="warning" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
  };
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border dark:border-slate-800">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-4 rounded-2xl", colors[color])}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick, theme }: any) {
  const themes: Record<string, string> = {
    primary: "bg-gradient-to-br from-primary to-blue-600 text-white",
    dark: "bg-slate-900 text-white border dark:border-slate-800",
    accent: "bg-accent text-white shadow-lg shadow-accent/20",
    light: "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white",
    warning: "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
  };
  return (
    <Card className={cn("border-none shadow-sm cursor-pointer hover:scale-[1.02] transition-transform", themes[theme])} onClick={onClick}>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", (theme === 'light') ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white/20')}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="font-black text-base lg:text-lg">{title}</p>
          <p className={cn("text-[10px] font-medium opacity-80", theme === 'light' && 'text-muted-foreground dark:text-slate-400')}>
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
