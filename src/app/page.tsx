/**
 * page.tsx
 * 
 * Route: /
 * Purpose: Primary landing gateway redesigned for high-fidelity brand immersion.
 * Refactored: v19.3.0 - Added Quick Access Grid for authenticated student nodes.
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { UserNav } from '@/components/UserNav';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { JsonLd } from '@/components/SEO';
import { trackEvent } from '@/lib/tracker';
import { SiteFooter } from '@/components/SiteFooter';
import { useAuth } from '@/context/auth-context';
import { ChatBot } from '@/components/shared/ChatBot';
import { BugReportButton } from '@/components/shared/BugReportButton';

// Extracted Sub-components
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { TacticalSection } from '@/components/landing/TacticalSection';
import { GlobalFeedback } from '@/components/landing/GlobalFeedback';
import { QuickAccessGrid } from '@/components/landing/QuickAccessGrid';

export default function LandingPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState('Optimal');
  const lastTracked = useRef<string | null>(null);

  const brandName = String(settings.platform_name || "DNTRNG");

  // REGISTRY UPLINK: Fetch tests for quick access if user is logged in
  const { data: tests } = useSWR(user ? '/api/proxy/tests' : null);
  
  // TELEMETRY UPLINK: Fetch global volume statistics
  const { data: publicStats } = useSWR('/api/proxy/public-stats');

  useEffect(() => {
    const key = 'page_view_home' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view_home');

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setSystemStatus(data.status || 'Offline');
      } catch (err) {
        setSystemStatus('Offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#2563EB] selection:text-white font-sans">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "name": brandName }} />
      
      {settings.announcement_banner && (
        <div className="bg-[#2563EB] text-white py-3 px-6 text-center relative overflow-hidden group">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SYSTEM BROADCAST
            </div>
            <p className="text-xs md:text-sm font-bold tracking-tight">{settings.announcement_banner}</p>
          </div>
        </div>
      )}

      <header className="py-4 px-6 md:px-12 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/brand/logo-horizontal.png" alt={brandName} width={150} height={38} priority />
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/tests" className="hover:text-primary transition-colors">{t('library')}</Link>
            {user && (
              <Link href="/profile" className="hover:text-primary transition-colors">{t('profile')}</Link>
            )}
            <Link href="/join" className="hover:text-rose-500 transition-colors">{t('joinLive')}</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection t={t} stats={publicStats} />
        
        {user && tests && tests.length > 0 && (
          <QuickAccessGrid tests={tests} />
        )}

        <FeatureGrid t={t} />
        <GlobalFeedback />
        <TacticalSection />
      </main>

      <SiteFooter />
      <ChatBot />
      <BugReportButton />
    </div>
  );
}
