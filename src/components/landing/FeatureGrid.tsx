/**
 * FeatureGrid.tsx
 * 
 * Purpose: Displays the modular capabilities of the assessment engine.
 * Logic: Maps high-level features to graphical cards with hover interpolation.
 */

"use client";

import React from 'react';
import { Layers, BarChart3, Database, LayoutGrid } from "lucide-react";

interface FeatureGridProps {
  t: (key: string) => string;
}

export function FeatureGrid({ t }: FeatureGridProps) {
  return (
    <section className="py-32 bg-white border-y border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">{t('statusActive')}</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-none">The Core Intelligence Engine.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Layers} 
            title="11+ Interaction Types" 
            desc="From spatial hotspots to complex matrix mapping, our engine supports every assessment modality." 
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Precision Analytics" 
            desc="Deep-dive into your performance with 1000-point Intel Indexes and step-by-step diagnostic audits." 
          />
          <FeatureCard 
            icon={Database} 
            title="Registry Synchronized" 
            desc="Powered by Google Sheets, ensuring total data ownership and sub-second registry handshakes." 
          />
          <FeatureCard 
            icon={LayoutGrid} 
            title="Identity Tracking" 
            desc="A centralized interaction history that documents your growth across every assessment mission." 
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6 p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  );
}
