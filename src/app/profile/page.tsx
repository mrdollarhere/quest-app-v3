"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Trophy, 
  Zap, 
  ArrowLeft, 
  LogOut, 
  Settings,
  Database,
  Clock,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_URL } from '@/lib/api-config';
import { UserNav } from '@/components/UserNav';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AILoader } from '@/components/ui/ai-loader';
import { Mail, Shield } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [responses, setResponses] = useState<any[]>([]);
  const [testsCount, setTestsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!API_URL) return;
    setLoadingStats(true);
    try {
      const [respRes, testsRes] = await Promise.all([
        fetch(`${API_URL}?action=getResponses`),
        fetch(`${API_URL}?action=getTests`)
      ]);
      const respData = await respRes.json();
      const testsData = await testsRes.json();
      
      if (Array.isArray(respData)) {
        // Filter responses for this user specifically
        const userEmail = user?.email?.toLowerCase() || '';
        const userResponses = respData.filter(r => (r['User Email'] || '').toLowerCase() === userEmail);
        setResponses(userResponses);
      }
      
      if (Array.isArray(testsData)) {
        setTestsCount(testsData.length);
      }
    } catch (err) {
      console.error("Failed to fetch profile stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const userStats = useMemo(() => {
    if (responses.length === 0) return { avg: 0, total: 0, highest: 0 };
    const totalPossible = responses.reduce((acc, r) => acc + (Number(r.Total) || 1), 0);
    const totalEarned = responses.reduce((acc, r) => acc + (Number(r.Score) || 0), 0);
    const pcts = responses.map(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100);
    
    return {
      avg: Math.round((totalEarned / totalPossible) * 100),
      total: responses.length,
      highest: Math.round(Math.max(...pcts))
    };
  }, [responses]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <AILoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary selection:text-white pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="py-6 px-6 md:px-12 border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-100 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/tests">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t('identityRegistry')}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('accountOverview')}</p>
            </div>
          </div>
          <UserNav />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Identity Card */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800">
              <div className="h-32 bg-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <Zap className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 fill-current" />
              </div>
              <div className="px-8 pb-10 -mt-16 relative z-10 text-center">
                <Avatar className="h-32 w-32 border-8 border-white dark:border-slate-900 shadow-2xl mx-auto mb-6">
                  {user.image_url && <AvatarImage src={user.image_url} alt={user.displayName} className="object-cover" />}
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-black text-4xl">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{user.displayName}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/5 dark:bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    {user.role} Operator
                  </Badge>
                </div>

                <div className="mt-10 space-y-4 text-left">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{t('identityKey')}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{t('accessProtocol')}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.role === 'admin' ? 'Admin' : 'Student'}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={logout}
                  variant="ghost" 
                  className="w-full mt-10 text-destructive hover:text-destructive hover:bg-destructive/5 font-bold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('terminateSession')}
                </Button>
              </div>
            </Card>

            {user.role === 'admin' && (
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 dark:bg-slate-900 text-white p-8 group relative overflow-hidden border border-transparent dark:border-slate-800">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Settings className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{t('adminConsole')}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                  You have full structural oversight. Manage intelligence modules, student identity, and global logs.
                </p>
                <Link href="/admin">
                  <Button className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest bg-primary hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    Enter Console
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Main Stats / Activity Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={History} 
                label={t('results')} 
                value={userStats.total} 
                sub="Completions"
                theme="blue"
              />
              <StatCard 
                icon={TrendingUp} 
                label={t('avgScore')} 
                value={`${userStats.avg}%`} 
                sub="Average Score"
                theme="green"
              />
              <StatCard 
                icon={Trophy} 
                label="Highest" 
                value={`${userStats.highest}%`} 
                sub="Best Performance"
                theme="purple"
              />
            </div>

            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 min-h-[500px] flex flex-col">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('sessionArchive')}</CardTitle>
                  <CardDescription className="font-medium text-slate-500 dark:text-slate-400">{t('historicalInteraction')}</CardDescription>
                </div>
                {loadingStats && <AILoader className="mb-0" iconClassName="w-6 h-6" />}
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {responses.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {responses.map((resp, i) => {
                      const pct = Math.round((Number(resp.Score) / (Number(resp.Total) || 1)) * 100);
                      return (
                        <div key={i} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border-2",
                              pct >= 80 ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400" : 
                              pct >= 50 ? "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900 text-orange-600 dark:text-orange-400" : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400"
                            )}>
                              {pct}%
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-lg group-hover:text-primary transition-colors">{resp['Test ID']}</p>
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(resp.Timestamp).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <span>{resp.Score} / {resp.Total} Points</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/quiz?id=${resp['Test ID']}`}>
                            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-all dark:hover:bg-slate-800">
                              <RotateCcw className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                    <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6">
                      <Database className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('noLogsDetected')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mt-2">{t('noTestsMessage')}</p>
                    <Link href="/tests" className="mt-8">
                      <Button className="rounded-full bg-primary font-black px-8 h-12 shadow-xl shadow-primary/20">
                        {t('exploreLibrary')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {user.role === 'admin' && (
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-6">{t('registryOverview')}</h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('activeModules')}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{testsCount}</span>
                    </div>
                    <Progress value={85} className="h-2 bg-slate-50 dark:bg-slate-800" />
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('structuralIntegrity')}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-6">{t('quickProtocol')}</h4>
                  <div className="flex flex-col gap-3">
                    <Link href="/admin/tests/new">
                      <Button variant="outline" className="w-full h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                        {t('injectNewTest')}
                      </Button>
                    </Link>
                    <Link href="/setup-guide">
                      <Button variant="ghost" className="w-full h-11 rounded-full font-black text-xs text-primary hover:bg-primary/5">
                        {t('viewSetupGuide')}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, theme }: any) {
  const themes: any = {
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900",
    green: "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900",
    purple: "text-purple-600 bg-purple-50/50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900"
  };
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6 group hover:shadow-xl transition-all rounded-[2rem] border border-transparent dark:border-slate-800">
      <div className="flex items-center gap-4">
        <div className={cn("p-4 rounded-2xl border transition-transform group-hover:scale-110", themes[theme])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-none mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{sub}</p>
        </div>
      </div>
    </Card>
  );
}
