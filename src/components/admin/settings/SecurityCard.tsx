/**
 * SecurityCard.tsx
 * 
 * Purpose: Manages access control, daily keys, and session protocols.
 * Used by: src/app/admin/settings/page.tsx
 * Props:
 *   - formData: Record<string, string> — current settings state
 *   - setFormData: (data: Record<string, string>) => void — state dispatcher
 *   - t: (key: string) => string — localization function
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, Fingerprint, Clock, AlertTriangle } from 'lucide-react';

interface SecurityCardProps {
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  t: (key: string) => string;
}

export function SecurityCard({ formData, setFormData, t }: SecurityCardProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
        <h2 className="text-xl font-black flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" aria-hidden="true" /> {t('securitySettings')}
        </h2>
        <CardDescription>Authentication protocols and access logic</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="protocol-salt" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('protocolSalt')}</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
            <Input 
              id="protocol-salt"
              value={formData.daily_key_salt}
              onChange={(e) => setFormData({ ...formData, daily_key_salt: e.target.value })}
              placeholder="Enter custom protocol salt"
              className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email-domains" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('allowedEmailDomains')}</Label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
              <Input 
                id="email-domains"
                value={formData.allowed_email_domains}
                onChange={(e) => setFormData({ ...formData, allowed_email_domains: e.target.value })}
                placeholder="e.g. gmail.com, company.com"
                className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('sessionTimeout')}</Label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
              <Input 
                id="session-timeout"
                type="number"
                value={formData.session_timeout_hours}
                onChange={(e) => setFormData({ ...formData, session_timeout_hours: e.target.value })}
                className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lockdown-duration" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('lockdownDuration')}</Label>
          <div className="relative">
            <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
            <Input 
              id="lockdown-duration"
              type="number"
              value={formData.registry_lockdown_duration}
              onChange={(e) => setFormData({ ...formData, registry_lockdown_duration: e.target.value })}
              placeholder="30"
              className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-sm"
            />
          </div>
          <p className="text-[9px] text-slate-400 italic px-1">Duration of platform quarantine for repeated identity violations.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <Label htmlFor="protection-toggle" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block cursor-pointer">{t('protectionEnabled')}</Label>
              <p className="text-xs text-slate-500 font-medium">Require daily access keys for all student nodes</p>
            </div>
            <Switch 
              id="protection-toggle"
              checked={formData.access_key_protection_enabled === 'true'} 
              onCheckedChange={(val) => setFormData({ ...formData, access_key_protection_enabled: String(val) })} 
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <Label htmlFor="guest-toggle" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block cursor-pointer">{t('guestAccessAllowed')}</Label>
              <p className="text-xs text-slate-500 font-medium">Allow students to join assessments without a registered account</p>
            </div>
            <Switch 
              id="guest-toggle"
              checked={formData.guest_access_allowed === 'true'} 
              onCheckedChange={(val) => setFormData({ ...formData, guest_access_allowed: String(val) })} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
