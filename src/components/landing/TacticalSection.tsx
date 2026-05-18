/**
 * TacticalSection.tsx
 * 
 * Purpose: Final conversion node for the landing gateway.
 * Compliance: Protocol v18.9.7 - Rectangular Geometry Enforced.
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Target, BookOpen, Zap, Database } from "lucide-react";

export function TacticalSection() {
  return (
    <section className="py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-none p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="flex-1 space-y-8 relative z-10">
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase leading-[0.9] tracking-tighter">
              Ready to test your <br /> <span className="text-primary">alignment?</span>
            </h3>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Entry into the intelligence registry is open. No account required to initialize your first mission. Browse our curated bank of assessments now.
            </p>
            <div className="pt-4">
              <Link href="/tests">
                <Button className="h-16 px-10 rounded-full bg-white text-slate-900 font-black text-lg shadow-xl hover:scale-[1.02] transition-transform border-none">
                  Launch Library Terminal
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <TacticalBadge icon={Target} label="High Accuracy" />
              <TacticalBadge icon={BookOpen} label="Curated Content" />
              <TacticalBadge icon={Zap} label="Instant Verdict" />
              <TacticalBadge icon={Database} label="Sync Ready" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TacticalBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-none border border-white/10 flex flex-col items-center gap-3 w-40">
      <Icon className="w-6 h-6 text-primary" />
      <span className="text-[10px] font-black uppercase text-white tracking-widest text-center">{label}</span>
    </div>
  );
}
