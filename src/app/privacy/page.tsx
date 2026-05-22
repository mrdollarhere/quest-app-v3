"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteFooter } from '@/components/SiteFooter';
import { ArrowLeft, ShieldAlert, Database, UserCheck, Lock } from 'lucide-react';
import { useSettings } from '@/context/settings-context';

export default function PrivacyPage() {
  const { settings } = useSettings();
  const brandName = String(settings.platform_name || "DNTRNG");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="py-6 px-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Back</span>
          </Link>
          <Image src="/brand/logo-horizontal.png" alt={brandName} width={120} height={30} priority />
        </div>
      </header>

      <main className="flex-1 py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">Privacy <br /> <span className="text-primary">& Security.</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Policy Version 19.2 • 2025</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PolicyCard icon={Database} title="Data Ownership" desc="Your assessment data lives in YOUR Google account. We never own your registry." />
            <PolicyCard icon={UserCheck} title="Identity Nodes" desc="Callsigns are used only for session identification and forensics." />
            <PolicyCard icon={Lock} title="Transmission" desc="All handshakes are encrypted and proxied via Next.js secure nodes." />
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-primary" /> 1. The Zero-Retention Protocol
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                The DNTRNG platform is designed as a stateless interface. We do not maintain a separate database for your assessments. When you interact with a mission, data is transmitted directly from your client node to your designated Google Apps Script bridge.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" /> 2. Data Persistence
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                All results, student responses, and analytics are stored in a private Google Sheet™ under your control. You have the right to purge, export, or modify this registry at any time without platform intervention.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary" /> 3. Forensic Analytics
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We capture basic environment telemetry (IP address, Browser, Device) during sessions to assist administrators in diagnostic triage and anti-spam enforcement. This data is logged exclusively in your private activity sheet.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function PolicyCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 transition-all hover:bg-white hover:shadow-xl group">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
