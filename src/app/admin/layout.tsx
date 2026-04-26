"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight, X } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from '@/context/auth-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { LanguageProvider } from '@/context/language-context';
import { AILoader } from '@/components/ui/ai-loader';
import { API_URL } from '@/lib/api-config';
import { REQUIRED_GAS_VERSION, GAS_CHANGELOG_URL } from '@/lib/gas-version';
import { trackEvent } from '@/lib/tracker';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [gasOutdated, setGasOutdated] = useState(false);
  const [currentGasVersion, setCurrentGasVersion] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      const fullPath = window.location.pathname + window.location.search;
      router.push(`/login?returnTo=${encodeURIComponent(fullPath)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!API_URL || !user || user.role !== 'admin') return;

    const checkGasVersion = async () => {
      const lastDismissed = localStorage.getItem('dntrng_gas_reminder_dismissed');
      if (lastDismissed) {
        const dismissedAt = parseInt(lastDismissed);
        if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) {
          return;
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${API_URL}?action=getVersion`, { signal: controller.signal });
        const data = await res.json();
        clearTimeout(timeoutId);
        
        if (data && data.version) {
          setCurrentGasVersion(data.version);
          if (data.version !== REQUIRED_GAS_VERSION) {
            setGasOutdated(true);
            setShowBanner(true);
          }
        }
      } catch (err) {}
    };

    checkGasVersion();
  }, [user]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('dntrng_gas_reminder_dismissed', Date.now().toString());
  };

  const activeTab = pathname === '/admin' ? 'overview' : 
                    pathname.startsWith('/admin/tests') ? 'tests' :
                    pathname.startsWith('/admin/users') ? 'users' :
                    pathname.startsWith('/admin/responses') ? 'responses' :
                    pathname.startsWith('/admin/activity') ? 'activity' :
                    pathname.startsWith('/admin/events') ? 'events' :
                    pathname.startsWith('/admin/settings') ? 'settings' : 'overview';

  const getHeaderTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname === '/admin/events') return 'Site Events';
    const last = pathname.split('/').pop() || '';
    if (last === 'new') return 'New Test';
    return last.replace(/-/g, ' ');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30 dark:bg-slate-950">
        <AILoader />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-950">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Access Denied</h1>
        <p className="text-muted-foreground mt-2 font-medium">Your identity role does not permit access to the administrative console.</p>
        <Link href="/" className="mt-8">
          <Button className="rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest bg-slate-900 shadow-xl">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-slate-50/30 dark:bg-slate-950 w-full transition-colors duration-300">
          <AdminSidebar 
            activeTab={activeTab as any} 
            user={user} 
            logout={logout} 
          />
          <main className="flex-1 flex flex-col">
            {showBanner && (
              <div className="bg-[#FEF9C3] border-b border-[#F59E0B] p-3 px-8 flex items-center justify-between animate-in slide-in-from-top duration-500 sticky top-0 z-[60]">
                <div className="flex items-center gap-4 text-[#92400E]">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-xs font-bold leading-none">
                    Your GAS script needs updating. Current: <span className="font-black">v{currentGasVersion || 'Unknown'}</span> — Required: <span className="font-black">v{REQUIRED_GAS_VERSION}</span>. 
                  </p>
                  <a href={GAS_CHANGELOG_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 ml-2">
                    See what changed <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleDismissBanner} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/50 rounded-full hover:bg-white">Remind me later</button>
                  <button onClick={() => setShowBanner(false)} className="p-1 hover:bg-white/50 rounded-full"><X className="w-4 h-4" /></button>
                </div>
              </div>
            )}
            
            <header className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h2 className="text-xl font-black capitalize tracking-tight text-slate-900 dark:text-white">
                    {getHeaderTitle()}
                  </h2>
                </div>
              </div>
            </header>
            <div className="p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
}
