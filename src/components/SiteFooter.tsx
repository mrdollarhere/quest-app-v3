"use client";

import React from 'react';
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
 */
export function SiteFooter({ className }: SiteFooterProps) {
  const { settings } = useSettings();
  const brandName = String(settings.platform_name || "DNTRNG");

  return (
    <footer className={cn("py-12 border-t border-slate-100 dark:border-slate-800 bg-transparent mt-auto", className)}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            {settings.custom_footer_text || `© ${new Date().getFullYear()} ${brandName.toUpperCase()} • PRECISION ASSESSMENT TERMINAL`}
          </p>
          <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
            Intelligence Registry v18.9.7 • All Rights Reserved
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
    </footer>
  );
}
