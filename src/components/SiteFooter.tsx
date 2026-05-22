"use client";

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';

interface SiteFooterProps {
  className?: string;
}

/**
 * DNTRNG™ GLOBAL BRAND FOOTER
 * 
 * Centralized signature component for brand identity and system telemetry.
 * Displays registry-defined platform name and system status.
 * Updated v19.5: Integrated tactical links (About, FAQ, Privacy, Contact).
 */
export function SiteFooter({ className }: SiteFooterProps) {
  const { settings } = useSettings();
  const brandName = String(settings.platform_name || "DNTRNG");

  return (
    <footer className={cn("py-16 border-t border-slate-100 dark:border-slate-800 bg-transparent mt-auto", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
               <img src="/brand/logo-horizontal.png" alt={brandName} className="h-8 w-auto grayscale opacity-50 dark:invert" />
            </div>
            <p className="text-slate-500 font-medium max-w-xs text-sm leading-relaxed">
              Professional assessment and intelligence engine for real-time classroom orchestration.
            </p>
          </div>
          
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Platform</h4>
              <nav className="flex flex-col gap-3 text-sm font-bold text-slate-400">
                <Link href="/tests" className="hover:text-primary transition-colors">Test Library</Link>
                <Link href="/join" className="hover:text-primary transition-colors">Live Join</Link>
                <Link href="/setup-guide" className="hover:text-primary transition-colors">Setup Guide</Link>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Registry</h4>
              <nav className="flex flex-col gap-3 text-sm font-bold text-slate-400">
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/faq" className="hover:text-primary transition-colors">Intelligence FAQ</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Support Registry</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Legal</h4>
              <nav className="flex flex-col gap-3 text-sm font-bold text-slate-400">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Node</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Security Protocol</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              {settings.custom_footer_text || `© ${new Date().getFullYear()} ${brandName.toUpperCase()} • PRECISION ASSESSMENT TERMINAL`}
            </p>
            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              Intelligence Registry v19.5 • All Rights Reserved
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center md:items-end gap-1">
              <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Powered by</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QuestFlow Engine</span>
            </div>
            
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block" />
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Registry Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
