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
  ListChecks,
  Star,
  Target,
  Activity,
  History,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    // Last 10 results, chronological (oldest to newest for chart)
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
      // New User: Recommend Beginner tests
      return tests
        .filter(t => String(t.difficulty || "").toLowerCase() === 'beginner' || String(t.difficulty || "").toLowerCase() === 'easy')
        .slice(0, 3);
    }

    // Active User: Recommend tests NOT taken yet or failed
    const takenIds = new Set(responses.map(r => String(r['Test ID'])));
    const notTaken = tests.filter(t => !takenIds.has(String(t.id)));
    
    if (notTaken.length > 0) {
      return notTaken.slice(0, 3);
    }

    // If all taken, recommend tests with scores < threshold
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
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/tests">
            <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-primary transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
            </Button>
          </Link>
          <Button 
            onClick={() => { trackEvent('logout'); logout(); router.push('/'); }} 
            variant="ghost" 
            size="sm" 
            className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Identity Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">{user?.displayName?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{user?.displayName}</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
            <div className="flex items-center gap-3 mt-6">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest">
                Student Operator
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-400">
                Level 1 Clearance
              </Badge>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center">
            <PerformanceGauge 
              percentage={stats.avg} 
              score={0} 
              totalQuestions={0} 
              compact={true} 
              hasData={hasHistory}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard icon={BookOpen} label="Tests taken" value={stats.taken} color="blue" />
          <MetricCard icon={Star} label="Best score" value={hasHistory ? `${stats.best}%` : "--"} color="green" />
          <MetricCard icon={Trophy} label="Perfect scores" value={stats.perfect} color="purple" />
        </div>

        {/* Performance Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-full">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Score History</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last 10 assessment nodes</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100"><TrendingUp className="w-5 h-5 text-primary" /></div>
              </div>

              {hasHistory ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                        labelStyle={{display: 'none'}}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Activity className="w-12 h-12" />
                  <p className="font-black uppercase text-xs tracking-widest">No Intelligence Data Recorded</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Target className="w-32 h-32 text-white" /></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">{hasHistory ? "Try these next" : "Start your first test"}</h3>
                </div>
                
                <div className="space-y-4 flex-1">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/quiz?id=${rec.id}`} className="block group/item">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white truncate uppercase mb-1">{rec.title}</p>
                          <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase">
                            <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {rec.questions_count || rec.questions || 0}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.duration || '15m'}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary group-hover/item:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No recommendations available at this time.</p>
                  )}
                </div>

                <Link href="/tests" className="mt-8">
                  <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-xl shadow-primary/20">
                    Explore All Tests <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Registry */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Interaction Registry</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {responses.map((r: any, i: number) => {
              const score = Number(r.Score) || 0;
              const total = Number(r.Total) || 1;
              const pct = Math.round((score / total) * 100);
              const threshold = Number(settings.default_pass_threshold || '70');
              const isPass = pct >= threshold;

              return (
                <div key={i} className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-colors",
                    isPass ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                  )}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight mb-1">{r['Test ID']}</h4>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(r.Timestamp).toLocaleDateString()}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">{score}/{total} Points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none",
                      isPass ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {isPass ? "Mastered" : "Needs Practice"}
                    </Badge>
                    <Link href={`/quiz?id=${r['Test ID']}`} onClick={() => trackEvent('quiz_retake', { test_id: r['Test ID'] })}>
                      <Button variant="outline" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-50 transition-all gap-2">
                        Retake <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {!hasHistory && (
              <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 shadow-inner">
                  <BookOpen className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Registry Clean</h4>
                  <p className="text-sm font-medium text-slate-400 max-w-[280px] mx-auto">Complete your first assessment to unlock detailed analytics and historical tracking.</p>
                </div>
                <Link href="/tests">
                  <Button className="h-12 px-8 rounded-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl border-none">Browse Intelligence Library</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
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
        <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{value}</p>
      </div>
    </div>
  );
}
