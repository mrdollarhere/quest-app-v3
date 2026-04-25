"use client";

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, ChevronRight, ListChecks, Clock, ArrowRight, Activity, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface ProfileChartsProps {
  chartData: any[];
  recommendations: any[];
  hasHistory: boolean;
}

export function ProfileCharts({ chartData, recommendations, hasHistory }: ProfileChartsProps) {
  return (
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
  );
}
