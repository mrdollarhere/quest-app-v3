"use client";

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Bell, AlertCircle, Database, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/context/language-context';
import { AILoader } from '@/components/ui/ai-loader';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';

import { BrandingCard } from '@/components/admin/settings/BrandingCard';
import { SecurityCard } from '@/components/admin/settings/SecurityCard';
import { AssessmentCard } from '@/components/admin/settings/AssessmentCard';

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
      setFormData(prev => ({
        ...prev,
        ...settings,
        // Ensure string conversion for registry compatibility
        platform_name: String(settings.platform_name || 'DNTRNG'),
      }));
    }
  }, [settings, settingsLoading]);

  const handleSaveAll = async () => {
    const changedKeys = Object.keys(formData).filter(key => {
      const current = String(settings[key] ?? "");
      return formData[key] !== current;
    });

    if (changedKeys.length === 0) return;

    setSaving(true);
    try {
      // Registry Protocol: Protected Proxy Save
      await Promise.all(changedKeys.map(key => 
        fetch('/api/proxy/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: formData[key] })
        })
      ));
      
      toast({ title: "Calibration Complete", description: `${changedKeys.length} nodes synchronized.` });
      logActivity("System calibration updated", `${changedKeys.length} nodes`);
      trackEvent('admin_settings_save');
      
      await refreshSettings();
    } catch (err) {
      toast({ variant: "destructive", title: "Calibration Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) return <div className="py-40"><AILoader /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('siteSettings')}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{t('platformConfig')}</p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={saving}
          className="h-14 px-8 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {t('saveAllSettings')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <BrandingCard formData={formData} setFormData={setFormData} t={t} />
          <SecurityCard formData={formData} setFormData={setFormData} t={t} />
        </div>
        <div className="lg:col-span-5 space-y-8">
          <AssessmentCard formData={formData} setFormData={setFormData} t={t} />
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Bell className="w-24 h-24" /></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Proxy Integrity</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Settings are committed through the server-side proxy node. Sensitive data (salts/URLs) is stripped from the frontend during hydration.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
