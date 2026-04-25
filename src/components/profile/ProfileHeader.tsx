"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { trackEvent } from '@/lib/tracker';

interface ProfileHeaderProps {
  user: any;
  logout: () => void;
  router: any;
}

export function ProfileHeader({ user, logout, router }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/tests">
          <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>
        
        {user?.role === 'admin' && (
          <Link href="/admin">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Admin Console
            </Button>
          </Link>
        )}
      </div>

      <Button 
        onClick={() => { trackEvent('logout'); logout(); router.push('/'); }} 
        variant="ghost" 
        size="sm" 
        className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-destructive transition-all"
      >
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
