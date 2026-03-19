
"use client";

import React from 'react';
import { 
  BarChart3, 
  Users as UsersIcon, 
  ClipboardList, 
  HelpCircle, 
  MessageSquare, 
  Settings, 
  LogOut 
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
import { AdminTab } from '@/app/admin/page';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  user: any;
  logout: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, user, logout }: AdminSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'tests', label: 'Assessments', icon: ClipboardList },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'users', label: 'User Table', icon: UsersIcon },
    { id: 'responses', label: 'Results & Logs', icon: MessageSquare }
  ];

  return (
    <Sidebar className="border-r shadow-sm">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl">
            <Settings className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">QuestFlow</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">Console v11.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Core Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.id} 
                    onClick={() => setActiveTab(item.id as AdminTab)} 
                    className={cn(
                      "h-12 px-4 rounded-xl font-bold transition-all border-2 border-transparent mb-1", 
                      activeTab === item.id 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" /> {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t bg-slate-50/50">
        <div className="p-4 bg-white rounded-[1.5rem] border shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900">{user?.displayName || 'Admin'}</span>
            <span className="text-[10px] text-muted-foreground font-medium truncate w-24">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
