"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from 'lucide-react';
import { trackEvent } from '@/lib/tracker';

interface ProfileHeaderProps {
  logout: () => void;
  router: any;
}

export function ProfileHeader({ logout, router }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Link href="/tests">
        <Button variant="ghost" size="sm" className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Button>
      </Link>
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
