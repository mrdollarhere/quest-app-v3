"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { SiteFooter } from '@/components/SiteFooter';
import { 
  Zap, 
  ShieldCheck, 
  Database, 
  Users, 
  Target, 
  Cpu,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useSettings } from '@/context/settings-context';

export default function AboutPage() {
  const { settings } = useSettings();
  const brandName = String(settings.platform_name || "DNTRNG");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="py-6 px-12 border-b border-slate-100 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-primary transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Return Home</span>
          </Link>
          <Image src="/brand/logo-horizontal.png" alt={brandName} width={120} height={30} priority />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50/50 -z-10" />
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              The Mission Registry
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              Intelligence <br /> <span className="text-primary">Redefined.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              DNTRNG (Dan Truong) is a high-performance assessment engine designed to transform Google Sheets™ into a real-time relational database for classroom intelligence.
            </p>
          </div>
        </section>

        {/* Vision Grid */}
        <section className="py-32 px-6 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tight leading-none">The Zero-Infrastructure Protocol</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  We believe that teachers should spend more time analyzing performance and less time managing servers. Our engine establishes a direct handshake with your own Google account, giving you 100% ownership of your data.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <TacticalNode icon={Database} title="Sheet Sync" desc="Your sheet is your database. No SQL required." />
                <TacticalNode icon={Cpu} title="V19.2 Engine" desc="Sub-second synchronization for live sessions." />
                <TacticalNode icon={ShieldCheck} title="Privacy First" desc="Data lives in your cloud, not our servers." />
                <TacticalNode icon={Users} title="Identity Nodes" desc="Advanced validation for real student data." />
              </div>
            </div>
            <div className="relative aspect-square bg-white/5 rounded-none border border-white/10 p-12 flex items-center justify-center overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <Target className="w-64 h-64 text-primary animate-pulse" />
               <div className="absolute bottom-12 left-12 right-12">
                 <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20">Operational Readiness</p>
               </div>
            </div>
          </div>
        </section>

        {/* Team / Origin */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Platform Origin</h2>
              <p className="text-slate-500 leading-relaxed text-lg">
                DNTRNG was born from the need for high-fidelity interactive assessments in Vietnamese classrooms. What started as a simple script evolved into a comprehensive intelligence terminal, now supporting multiple languages and complex interaction modules like spatial hotspot mapping and matrix classification.
              </p>
            </div>
            <div className="p-10 bg-slate-50 rounded-none border-l-4 border-primary">
               <p className="text-lg font-bold italic text-slate-700">"Information is data. Intelligence is how you act on it."</p>
               <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary">— DNTRNG Development Team</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function TacticalNode({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h4 className="text-sm font-black uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
