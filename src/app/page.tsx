"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Database, Smartphone, CheckCircle, LayoutGrid, ShieldCheck, Zap } from "lucide-react";
import { UserNav } from '@/components/UserNav';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-4 md:px-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg rotate-3 group hover:rotate-0 transition-transform">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">DNTRNG</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tests" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="font-bold rounded-full">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Library
              </Button>
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-16 md:py-32">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Next-Gen Assessment Engine
          </div>
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900 leading-[0.9]">
            Assessments for the <span className="text-primary italic">Modern Era.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            DNTRNG bridges the gap between spreadsheet simplicity and enterprise-grade interactivity. Build, deploy, and scale in seconds.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/tests">
              <Button size="lg" className="h-16 px-12 text-lg rounded-full shadow-2xl hover:scale-105 transition-all bg-primary font-black">
                Launch Platform
              </Button>
            </Link>
            <Link href="/quiz?id=demo-full">
              <Button size="lg" variant="outline" className="h-16 px-12 text-lg rounded-full hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-black transition-all">
                <Play className="w-5 h-5 mr-2 fill-slate-900" />
                Live Preview
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Sheet Intelligence",
              description: "Direct bi-directional sync with Google Sheets for logic and storage.",
              icon: Database
            },
            {
              title: "Rich Interaction",
              description: "Hotspots, matching, and multi-state ordering for deep engagement.",
              icon: CheckCircle
            },
            {
              title: "Global Scalability",
              description: "Lightweight architecture optimized for sub-second performance.",
              icon: Smartphone
            }
          ].map((feature, i) => (
            <Card key={i} className="border-none shadow-xl bg-white/60 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] p-6 group">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-500">
                  <feature.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base font-medium leading-relaxed text-slate-500">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="py-20 text-center text-slate-400 border-t bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-10">
          <div className="flex flex-wrap justify-center items-center gap-10">
            <Link href="/admin" className="text-xs font-black uppercase tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Console
            </Link>
            <Link href="/setup-guide" className="text-xs font-black uppercase tracking-widest hover:text-primary flex items-center gap-2 transition-colors">
              Architecture
            </Link>
          </div>
          <div className="h-px w-20 bg-slate-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} DNTRNG PLATFORM • v8.5 PRO</p>
        </div>
      </footer>
    </div>
  );
}