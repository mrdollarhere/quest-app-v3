"use client";

import React, { useEffect } from 'react';
import { ShieldAlert } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from '@/context/auth-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { LanguageProvider } from '@/context/language-context';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirection Protocol: Force unauthenticated users to the identity registry
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Determine active tab from pathname
  const activeTab = pathname === '/admin' ? 'overview' : 
                    pathname.startsWith('/admin/tests') ? 'tests' :
                    pathname.startsWith('/admin/users') ? 'users' :
                    pathname.startsWith('/admin/responses') ? 'responses' :
                    pathname.startsWith('/admin/activity') ? 'activity' : 'overview';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30 dark:bg-slate-950">
        <AILoader />
      </div>
    );
  }

  // Prevent flash of content during redirect
  if (!user) {
    return null;
  }

  // Authorization Protocol: Restrict access to authenticated non-admins
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
          <main className="flex-1">
            <header className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h2 className="text-xl font-black capitalize tracking-tight text-slate-900 dark:text-white">
                    {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Console Active
                  </span>
                </div>
              </div>
            </header>
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
}
