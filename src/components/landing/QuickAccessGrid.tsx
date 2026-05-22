/**
 * QuickAccessGrid.tsx
 * 
 * Purpose: Renders a compact selection of available assessments for authenticated users.
 * Logic: Selects a subset of the test library for instantaneous reentry.
 * Visual: Adheres to Protocol v18.9.7 - Rectangular Geometry.
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { CardView } from '@/components/library/CardView';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAccessGridProps {
  tests: any[];
}

export function QuickAccessGrid({ tests }: QuickAccessGridProps) {
  // Selection Protocol: Display top 4 modules for high-velocity access
  const quickTests = tests.slice(0, 4);

  return (
    <section className="py-20 px-6 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Identity Context Active</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">Your Next Mission.</h2>
            <p className="text-slate-500 font-medium">Synchronized modules ready for initialization.</p>
          </div>
          
          <Link href="/tests">
            <Button variant="ghost" className="rounded-full font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-primary transition-all gap-2">
              <LayoutGrid className="w-4 h-4" />
              Full Library Registry
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardView tests={quickTests} />
        </div>
      </div>
    </section>
  );
}
