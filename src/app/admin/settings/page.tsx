"use client";

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Loader2, 
  Bell, 
  Database, 
  FileSpreadsheet, 
  Users, 
  Lock, 
  ShieldCheck, 
  Plus, 
  X, 
  Trash2,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '@/context/language-context';
import { AILoader } from '@/components/ui/ai-loader';
import { logActivity } from '@/lib/activity-log';
import { trackEvent } from '@/lib/tracker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    google_sheet_url: '',
    join_mode: 'open',
    name_whitelist: '[]'
  });

  const [bulkInput, setBulkInput] = useState('');

  const fetchFullSettings = async () => {
    setLoading(true);
    try {
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

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch('/api/proxy/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      await refreshSettings();
    } catch (err) {
      console.error(`[Settings] Failed to save ${key}`);
      throw err;
    }
  };

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
      await Promise.all(changedKeys.map(key => saveSetting(key, String(formData[key]))));
      
      toast({ title: "Calibration Complete", description: `${changedKeys.length} nodes synchronized.` });
      logActivity("System calibration updated", `${changedKeys.length} nodes`);
      trackEvent('admin_settings_save');
      
      setInitialData({ ...formData });
    } catch (err) {
      toast({ variant: "destructive", title: "Calibration Failed" });
    } finally {
      setSaving(false);
    }
  };

  const whitelist = JSON.parse(formData.name_whitelist || '[]');

  const updateWhitelist = async (newList: string[]) => {
    const json = JSON.stringify(newList);
    setFormData({ ...formData, name_whitelist: json });
    try {
      await saveSetting('name_whitelist', json);
      setInitialData(prev => ({ ...prev, name_whitelist: json }));
    } catch (e) {
      toast({ variant: "destructive", title: "Whitelist Sync Failed" });
    }
  };

  const addWhitelistName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (whitelist.some((n: string) => n.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Duplicate Entry", description: "This identity node is already registered." });
      return;
    }
    updateWhitelist([...whitelist, trimmed]);
  };

  const removeWhitelistName = (name: string) => {
    updateWhitelist(whitelist.filter((n: string) => n !== name));
  };

  const handleBulkImport = () => {
    const names = bulkInput.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const combined = Array.from(new Set([...whitelist, ...names]));
    const importedCount = combined.length - whitelist.length;
    
    updateWhitelist(combined);
    setBulkInput('');
    toast({ title: "Import Successful", description: `${importedCount} new identity nodes registered.` });
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
          
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-primary" /> Live Access Control
                  </h2>
                  <CardDescription>Restrict join access to specific student rosters</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.join_mode === 'whitelist'}
                    onCheckedChange={(val) => {
                      const mode = val ? 'whitelist' : 'open';
                      setFormData({ ...formData, join_mode: mode });
                      saveSetting('join_mode', mode).then(() => {
                        setInitialData(prev => ({ ...prev, join_mode: mode }));
                        toast({ title: `Access: ${mode.toUpperCase()}` });
                      });
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                {formData.join_mode === 'open' ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase tracking-widest text-[9px] px-3 py-1">
                    🟢 OPEN MODE — All valid names accepted
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 py-1">
                    🔒 WHITELIST MODE — {whitelist.length} names approved
                  </Badge>
                )}
              </div>

              {formData.join_mode === 'whitelist' && (
                <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Manual Addition</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="new-name"
                          placeholder="Student full name..."
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 font-bold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addWhitelistName(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <Button 
                          variant="secondary"
                          className="h-12 w-12 rounded-xl p-0 shrink-0"
                          onClick={() => {
                            const input = document.getElementById('new-name') as HTMLInputElement;
                            addWhitelistName(input.value);
                            input.value = '';
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bulk Roster Ingestion</Label>
                      <Textarea 
                        placeholder="Paste names, one per line..."
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        className="rounded-xl min-h-[48px] h-12 bg-slate-50 border-none ring-1 ring-slate-100 font-medium py-3"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleBulkImport}
                        disabled={!bulkInput.trim()}
                        className="w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-2"
                      >
                        Import Roster
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Approved Identity Nodes ({whitelist.length})</Label>
                      {whitelist.length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black uppercase text-[9px] tracking-widest rounded-full">
                              <Trash2 className="w-3 h-3 mr-2" /> Clear All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Purge Whitelist?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 font-medium">This will permanently delete all {whitelist.length} approved identities from the registry.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-3">
                              <AlertDialogCancel className="rounded-full font-bold uppercase text-[10px] h-12">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => updateWhitelist([])} className="rounded-full bg-rose-500 text-white font-black uppercase text-[10px] h-12 border-none">Purge Registry</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 min-h-[120px]">
                      {whitelist.map((name: string) => (
                        <Badge 
                          key={name} 
                          variant="secondary" 
                          className="pl-3 pr-1 py-1 gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm text-xs font-bold"
                        >
                          {name}
                          <button 
                            onClick={() => removeWhitelistName(name)}
                            className="p-1 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                      {whitelist.length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center opacity-20 py-8">
                          <Users className="w-8 h-8 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-center">No identities registered</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
