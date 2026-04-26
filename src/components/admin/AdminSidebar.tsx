"use client";

import React from 'react';
import { 
  BarChart3, 
  Users as UsersIcon, 
  ClipboardList, 
  Zap, 
  LogOut,
  MessageSquare,
  History,
  Languages,
  Settings as SettingsIcon,
  Activity,
  FileSpreadsheet,
  ExternalLink
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage, Language } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

export type AdminTab = 'overview' | 'tests' | 'users' | 'responses' | 'activity' | 'settings' | 'events';

interface AdminSidebarProps {
  activeTab: AdminTab;
  user: any;
  logout: () => void;
}

export const AdminSidebar = React.memo(({ activeTab, user, logout }: AdminSidebarProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();

  const brandName = settings.platform_name || "DNTRNG";
  const sheetUrl = settings.google_sheet_url;

  const menuItems = [
    { id: 'overview', label: t('dashboard'), icon: BarChart3, href: '/admin' },
    { id: 'tests', label: t('testLibrary'), icon: ClipboardList, href: '/admin/tests' },
    { id: 'users', label: t('students'), icon: UsersIcon, href: '/admin/users' },
    { id: 'responses', label: t('results'), icon: MessageSquare, href: '/admin/responses' },
    { id: 'events', label: 'Intelligence Feed', icon: Activity, href: '/admin/events' },
    { id: 'activity', label: t('activity'), icon: History, href: '/admin/activity' },
    { id: 'settings', label: t('settings'), icon: SettingsIcon, href: '/admin/settings' }
  ];

  return (
    <Sidebar className="border-r border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900" role="navigation">
      <SidebarHeader className="p-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="block" aria-label="Go to homepage">
            <Image src="/brand/logo-horizontal.png" alt={brandName} width={130} height={32} />
          </Link>
          <div>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1.5">{t('adminConsole')}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link href={item.href} aria-current={activeTab === item.id ? "page" : undefined}>
                    <SidebarMenuButton 
                      isActive={activeTab === item.id} 
                      className={cn(
                        "h-14 px-5 rounded-2xl font-black transition-all mb-2", 
                        activeTab === item.id 
                          ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-4" aria-hidden="true" /> {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Registry</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {sheetUrl ? (
                  <SidebarMenuButton asChild className="h-14 px-5 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all mb-2">
                    <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                      <FileSpreadsheet className="w-5 h-5 mr-4 text-primary" />
                      <div className="flex flex-1 items-center justify-between">
                        <span>{t('dataSheet')}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild className="h-14 px-5 rounded-2xl font-black text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all mb-2">
                    <Link href="/admin/settings#sheet-url-field">
                      <FileSpreadsheet className="w-5 h-5 mr-4 opacity-40" />
                      <div className="flex flex-1 items-center justify-between">
                        <span>{t('connectSheet')}</span>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 rounded-md border-slate-200 dark:border-slate-800">
                          {t('addInSettings')}
                        </Badge>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 mt-10">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Language</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-10 rounded-xl justify-between border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-widest bg-white dark:bg-slate-800" aria-label="Change language">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Languages className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    {language === 'en' ? 'English' : language === 'vi' ? 'Tiếng Việt' : 'Español'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px] rounded-xl p-1 dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="start">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="font-bold cursor-pointer rounded-lg">English (US)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('vi')} className="font-bold cursor-pointer rounded-lg">Tiếng Việt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')} className="font-bold cursor-pointer rounded-lg">Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.displayName || 'Admin'}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest truncate">{user?.role}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-destructive hover:bg-destructive/10" aria-label="Sign out">
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

AdminSidebar.displayName = 'AdminSidebar';