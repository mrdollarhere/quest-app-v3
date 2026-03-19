"use client";

import React from 'react';
import { 
  BarChart3, 
  Users as UsersIcon, 
  ClipboardList, 
  Zap, 
  LogOut,
  MessageSquare
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
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type AdminTab = 'overview' | 'tests' | 'users' | 'responses';

interface AdminSidebarProps {
  activeTab: AdminTab;
  user: any;
  logout: () => void;
}

export function AdminSidebar({ activeTab, user, logout }: AdminSidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, href: '/admin' },
    { id: 'tests', label: 'Library Management', icon: ClipboardList, href: '/admin/tests' },
    { id: 'users', label: 'Access Control', icon: UsersIcon, href: '/admin/users' },
    { id: 'responses', label: 'Intelligence Logs', icon: MessageSquare, href: '/admin/responses' }
  ];

  return (
    <Sidebar className="border-r shadow-sm bg-white">
      <SidebarHeader className="p-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-xl rotate-3">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">DNTRNG</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1.5">Console v17.5</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Core Engine</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link href={item.href}>
                    <SidebarMenuButton 
                      isActive={activeTab === item.id} 
                      className={cn(
                        "h-14 px-5 rounded-2xl font-black transition-all mb-2", 
                        activeTab === item.id 
                          ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-4" /> {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t bg-slate-50/50">
        <div className="p-5 bg-white rounded-[2rem] border shadow-sm flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-slate-900 truncate">{user?.displayName || 'Operator'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{user?.role}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}