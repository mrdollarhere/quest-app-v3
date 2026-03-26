'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutGrid, ShieldCheck, LogIn, User, Settings, Sun, Moon } from "lucide-react";
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';

export function UserNav() {
  const { user, logout, loading } = useAuth();
  const { setTheme, theme } = useTheme();
  const { t } = useLanguage();

  if (loading) return <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />;

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" className="rounded-full shadow-sm">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all p-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/5 dark:bg-primary/20 text-primary font-bold">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 rounded-2xl shadow-2xl p-2 border-none" align="right" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground font-medium">{user.email}</p>
            <div className="pt-2">
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-50" />
        
        <Link href="/profile">
          <DropdownMenuItem className="rounded-lg p-2.5 font-bold cursor-pointer">
            <User className="mr-2 h-4 w-4 text-primary" />
            <span>Identity Registry</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/tests">
          <DropdownMenuItem className="rounded-lg p-2.5 font-bold cursor-pointer">
            <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
            <span>Browse Library</span>
          </DropdownMenuItem>
        </Link>

        {user.role === 'admin' && (
          <Link href="/admin">
            <DropdownMenuItem className="rounded-lg p-2.5 font-bold cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator className="opacity-50" />
        
        <DropdownMenuItem 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2.5 font-bold cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="mr-2 h-4 w-4 text-primary" />
          ) : (
            <Moon className="mr-2 h-4 w-4 text-primary" />
          )}
          <span>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="opacity-50" />
        
        <DropdownMenuItem onClick={logout} className="rounded-lg p-2.5 font-bold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
