"use client";

import React from 'react';
import Link from 'next/link';
import { Wrench, ArrowRight, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MaintenanceViewProps {
  platformName: string;
  logoUrl?: string;
  eta?: string;
  supportEmail?: string;
  isAdmin: boolean;
  onReturnHome: () => void;
}

/**
 * DNTRNG™ MAINTENANCE PROTOCOL TERMINAL
 * 
 * A high-fidelity diagnostic gateway displayed during system calibration.
 */
export function MaintenanceView({ 
  platformName, 
  logoUrl, 
  eta, 
  supportEmail, 
  isAdmin, 
  onReturnHome 
}: MaintenanceViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      {/* Platform Identifier */}
      <div className="mb-10 flex items-center gap-3 opacity-30 select-none">
        <img 
          src={logoUrl || "/brand/logo-horizontal.png"} 
          alt="" 
          className="h-6 w-auto grayscale" 
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-900">{platformName}</span>
      </div>

      <Card className="max-w-[480px] w-full border-none shadow-2xl rounded-[2.5rem] bg-white p-12 overflow-hidden relative border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
        
        <div className="flex flex-col items-center">
          {/* Animated Diagnostic Icon */}
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-10 animate-pulse shadow-inner border border-amber-100">
            <Wrench className="w-12 h-12 text-amber-500 rotate-12" />
          </div>

          {/* Bilingual Heading Registry */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Under Maintenance</h2>
            <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-tight leading-none">Đang Bảo Trì</h3>
          </div>

          <p className="text-sm font-medium text-slate-500 mt-8 leading-relaxed max-w-[320px]">
            We're making improvements to serve you better.
            <br />
            <span className="opacity-60 italic">Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn.</span>
          </p>

          {/* Optional ETA Node */}
          {eta && (
            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 w-full shadow-inner animate-in slide-in-from-top-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Expected Back / Dự kiến hoàn thành</p>
              <p className="text-xl font-black text-primary tracking-tight">{eta}</p>
            </div>
          )}

          {/* Real-time Telemetry Status */}
          <div className="mt-10 w-full space-y-4">
            <StatusPulseItem label="System Update In Progress" />
            <StatusPulseItem label="Data Migration Running" />
            <StatusPulseItem label="Performance Optimization" />
          </div>

          {/* Support Handshake Node */}
          {supportEmail && (
            <div className="mt-12 pt-10 border-t border-slate-100 w-full space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">Need urgent help? / Hỗ trợ khẩn cấp</p>
              <a 
                href={`mailto:${supportEmail}`} 
                className="flex items-center justify-center gap-2 text-primary font-black uppercase text-xs hover:scale-105 transition-transform"
              >
                <Mail className="w-4 h-4" />
                {supportEmail}
              </a>
            </div>
          )}

          {/* Navigation Path */}
          <div className="mt-12 w-full">
            <Button 
              variant="outline" 
              onClick={onReturnHome} 
              className="w-full h-16 rounded-full border-2 border-primary text-primary font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary/5 shadow-sm"
            >
              Return Home / Về Trang Chủ
            </Button>
          </div>

          {/* Secure Admin Bypass Link */}
          {isAdmin && (
            <Link 
              href="/admin" 
              className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-primary transition-colors flex items-center gap-2 group"
            >
              Admin? Access Dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </Card>
      
      <p className="mt-10 text-[9px] font-black uppercase tracking-[1em] text-slate-200 select-none">
        DNTRNG™ • REGISTRY OFFLINE
      </p>
    </div>
  );
}

function StatusPulseItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 text-left px-4">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
    </div>
  );
}
