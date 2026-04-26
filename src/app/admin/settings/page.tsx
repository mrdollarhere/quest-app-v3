"use client";

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Lock,
  Zap,
  LayoutGrid,
  Bell,
  Target,
  ImageIcon,
  Megaphone,
  Fingerprint,
  Clock,
  UserCheck,
  Palette,
  AlignLeft,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/context/language-context';
import { AILoader } from '@/components/ui/ai-loader';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';

export default function AdminSettingsPage() {
  const { settings, loading: settingsLoading, refreshSettings } = useSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, string>>({
    platform_name: '',
    logo_url: '',
    support_email: '',
    announcement_banner: '',
    custom_footer_text: '',
    theme_primary_color: '#2563EB',
    daily_key_salt: '',
    access_key_protection_enabled: 'true',
    default_pass_threshold: '70',
    global_timer_limit: '15',
    enable_benchmarking: 'true',
    maintenance_mode: 'false',
    allowed_email_domains: '',
    session_timeout_hours: '24',
    guest_access_allowed: 'true',
    google_sheet_url: ''
  });

  useEffect(() => {
    if (!settingsLoading && settings) {
      setFormData({
        platform_name: String(settings.platform_name || 'DNTRNG'),
        logo_url: settings.logo_url || '',
        support_email: settings.support_email || '',
        announcement_banner: settings.announcement_banner || '',
        custom_footer_text: settings.custom_footer_text || '',
        theme_primary_color: settings.theme_primary_color || '#2563EB',
        daily_key_salt: settings.daily_key_salt || '',
        access_key_protection_enabled: String(settings.access_key_protection_enabled ?? 'true'),
        default_pass_threshold: settings.default_pass_threshold || '70',
        global_timer_limit: settings.global_timer_limit || '15',
        enable_benchmarking: String(settings.enable_benchmarking ?? 'true'),
        maintenance_mode: String(settings.maintenance_mode ?? 'false'),
        allowed_email_domains: settings.allowed_email_domains || '',
        session_timeout_hours: settings.session_timeout_hours || '24',
        guest_access_allowed: String(settings.guest_access_allowed ?? 'true'),
        google_sheet_url: settings.google_sheet_url || ''
      });
    }
  }, [settings, settingsLoading]);

  const currentSnapshot: Record<string, string> = {
    platform_name: String(settings.platform_name || 'DNTRNG'),
    logo_url: settings.logo_url || '',
    support_email: settings.support_email || '',
    announcement_banner: settings.announcement_banner || '',
    custom_footer_text: settings.custom_footer_text || '',
    theme_primary_color: settings.theme_primary_color || '#2563EB',
    daily_key_salt: settings.daily_key_salt || '',
    access_key_protection_enabled: String(settings.access_key_protection_enabled ?? 'true'),
    default_pass_threshold: settings.default_pass_threshold || '70',
    global_timer_limit: settings.global_timer_limit || '15',
    enable_benchmarking: String(settings.enable_benchmarking ?? 'true'),
    maintenance_mode: String(settings.maintenance_mode ?? 'false'),
    allowed_email_domains: settings.allowed_email_domains || '',
    session_timeout_hours: settings.session_timeout_hours || '24',
    guest_access_allowed: String(settings.guest_access_allowed ?? 'true'),
    google_sheet_url: settings.google_sheet_url || ''
  };

  const hasChanges = Object.keys(formData).some(
    (key) => formData[key] !== currentSnapshot[key]
  );

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return false;
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleSaveAll = async () => {
    const changedKeys = Object.keys(formData).filter(
      (key) => formData[key] !== currentSnapshot[key]
    );

    if (changedKeys.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(changedKeys.map(key => handlePost('saveSetting', { key, value: formData[key] })));
      
      toast({ 
        title: "Registry Updated", 
        description: `${changedKeys.length} system preference(s) synchronized.` 
      });
      
      logActivity("System settings updated", `${changedKeys.length} preference(s) calibrated`);
      
      // TELEMETRY: Track settings save and key changes
      trackEvent('admin_settings_save', { 
        details: { 
          changed_fields: changedKeys, 
          platform_name: formData.platform_name 
        } 
      });

      if (changedKeys.includes('daily_key_salt')) {
        trackEvent('admin_access_key_change');
      }
      
      await refreshSettings();
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Sync Error", 
        description: "Could not commit all settings to the registry." 
      });
    } finally {
      setSaving(false);
    }
  };

  const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

  if (settingsLoading) {
    return (
      <div className="py-40">
        <AILoader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('siteSettings')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{t('platformConfig')}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleSaveAll} 
            disabled={saving || !hasChanges}
            aria-describedby="global-save-description"
            className="h-14 px-8 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t('saveAllSettings')}
          </Button>
          <span id="global-save-description" className="sr-only">Commits all modified settings to the Google Sheets database.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Branding & Security */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" aria-hidden="true" /> {t('branding')}
              </h2>
              <CardDescription>Global visual identity and contact registry</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('platformName')}</Label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="platform-name"
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme-color" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('themePrimaryColor')}</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ring-1 ring-slate-100 shadow-sm transition-all hover:scale-105 active:scale-95 group"
                      aria-label={`Current theme color: ${formData.theme_primary_color}. Click to change.`}
                    >
                      <input 
                        id="theme-color-picker"
                        type="color"
                        value={isValidHex(formData.theme_primary_color) ? formData.theme_primary_color : '#2563EB'}
                        onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value.toUpperCase() })}
                        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer bg-transparent border-none appearance-none"
                      />
                      <div 
                        className="w-full h-full pointer-events-none"
                        style={{ backgroundColor: isValidHex(formData.theme_primary_color) ? formData.theme_primary_color : '#2563EB' }}
                      />
                    </div>
                    <div className="relative flex-1">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                      <Input 
                        id="theme-color"
                        value={formData.theme_primary_color}
                        onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                        placeholder="#2563EB"
                        className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-text" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('customFooterText')}</Label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                    <Input 
                      id="footer-text"
                      value={formData.custom_footer_text}
                      onChange={(e) => setFormData({ ...formData, custom_footer_text: e.target.value })}
                      placeholder="© 2025 Your Legal Text"
                      className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('logoUrl')}</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="logo-url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    aria-describedby="logo-url-hint"
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-sm"
                  />
                </div>
                <p id="logo-url-hint" className="text-[10px] text-slate-400 mt-1">Provide a public link to an image. Leave blank to use the default DNTRNG icon.</p>
                {formData.logo_url && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <img src={formData.logo_url} alt="Logo Preview" className="h-12 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('announcementBanner')}</Label>
                <div className="relative">
                  <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="announcement"
                    value={formData.announcement_banner}
                    onChange={(e) => setFormData({ ...formData, announcement_banner: e.target.value })}
                    placeholder="Enter broadcast message"
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('supportEmail')}</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="support-email"
                    type="email"
                    value={formData.support_email}
                    onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                    placeholder="support@yourplatform.com"
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="sheet-url-field" className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" aria-hidden="true" /> {t('integrations')}
              </h2>
              <CardDescription>Connect external data nodes</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="google-sheet-url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('googleSheetUrl')}</Label>
                <div className="relative">
                  <FileSpreadsheet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="google-sheet-url"
                    value={formData.google_sheet_url}
                    onChange={(e) => setFormData({ ...formData, google_sheet_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{t('googleSheetUrlHint')}</p>
              </div>
            </CardContent>
          </Card>

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
                <p className="text-[9px] font-medium text-slate-400 mt-2 px-1">Rotating daily keys are generated using this value as a base.</p>
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
                      placeholder={t('allowedDomainsPlaceholder')}
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
                    <p className="text-xs text-slate-500 font-medium">{t('guestAccessDesc')}</p>
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
        </div>

        {/* Right Column: Assessment Logic */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" aria-hidden="true" /> {t('assessmentConfig')}
              </h2>
              <CardDescription>Global evaluation and analysis settings</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <Label htmlFor="pass-threshold" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('passThreshold')}</Label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="pass-threshold"
                    type="number"
                    value={formData.default_pass_threshold}
                    onChange={(e) => setFormData({ ...formData, default_pass_threshold: e.target.value })}
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timer-limit" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('globalTimerLimit')}</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    id="timer-limit"
                    type="number"
                    value={formData.global_timer_limit}
                    onChange={(e) => setFormData({ ...formData, global_timer_limit: e.target.value })}
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-sm"
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400 mt-2 px-1">{t('globalTimerLimitDesc')}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="benchmark-toggle" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block cursor-pointer">{t('enableBenchmarking')}</Label>
                    <p className="text-[10px] text-slate-500 font-medium">Show comparative results to students</p>
                  </div>
                  <Switch 
                    id="benchmark-toggle"
                    checked={formData.enable_benchmarking === 'true'} 
                    onCheckedChange={(val) => setFormData({ ...formData, enable_benchmarking: String(val) })} 
                  />
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" aria-hidden="true" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="maintenance-toggle" className="text-sm font-black text-red-600 uppercase tracking-tight block cursor-pointer">{t('maintenanceMode')}</Label>
                    <p className="text-[10px] text-slate-500 font-medium">Prevent all new assessment sessions</p>
                  </div>
                  <Switch 
                    id="maintenance-toggle"
                    checked={formData.maintenance_mode === 'true'} 
                    onCheckedChange={(val) => setFormData({ ...formData, maintenance_mode: String(val) })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10" aria-hidden="true">
              <Bell className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="bg-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">System Integrity</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Changes applied here will affect all student nodes globally upon their next session initialization. 
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
