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
  const { refreshSettings } = useSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<Record<string, string>>({});
  
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
    registry_lockdown_duration: '30',
    guest_access_allowed: 'true',
    google_sheet_url: ''
  });

  const fetchFullSettings = async () => {
    setLoading(true);
    try {
      // REGISTRY PROTOCOL: Use protected admin proxy to fetch sensitive calibration nodes
      const res = await fetch('/api/proxy/admin/settings');
      if (!res.ok) throw new Error('Registry Access Denied');
      const data = await res.json();
      
      const normalized = { ...formData, ...data };
      setFormData(normalized);
      setInitialData(normalized);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not retrieve full calibration registry." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullSettings();
  }, []);

  const handleSaveAll = async () => {
    const changedKeys = Object.keys(formData).filter(key => {
      const current = String(initialData[key] ?? "");
      return String(formData[key]) !== current;
    });

    if (changedKeys.length === 0) {
      toast({ title: "No Changes", description: "Registry is already synchronized." });
      return;
    }

    setSaving(true);
    try {
      // Registry Protocol: Protected Proxy Save
      await Promise.all(changedKeys.map(key => 
        fetch('/api/proxy/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: String(formData[key]) })
        })
      ));
      
      toast({ title: "Calibration Complete", description: `${changedKeys.length} nodes synchronized.` });
      logActivity("System calibration updated", `${changedKeys.length} nodes`);
      trackEvent('admin_settings_save');
      
      setInitialData({ ...formData });
      await refreshSettings();
    } catch (err) {
      toast({ variant: "destructive", title: "Calibration Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-40"><AILoader messages={["Accessing System Registry...", "Retrieving Calibration Nodes..."]} /></div>;

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
          
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-primary" /> {t('integrations')}
              </h2>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheet-url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('googleSheetUrl')}</Label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    id="sheet-url"
                    value={formData.google_sheet_url}
                    onChange={(e) => setFormData({ ...formData, google_sheet_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs"
                  />
                </div>
                <p className="text-[9px] text-slate-400 italic px-1">{t('googleSheetUrlHint')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Bell className="w-24 h-24" /></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Proxy Integrity</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Settings are committed through the server-side proxy node. Sensitive data (salts/URLs) is stripped from the public frontend registry during hydration.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
