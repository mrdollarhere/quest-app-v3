"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Key, 
  CalendarDays, 
  Copy, 
  Settings2, 
  Save,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { generateDailyPassword } from '@/lib/security-utils';
import { addDays, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';

interface AccessKeyPanelProps {
  settings: Record<string, string>;
  lastSync: Date | null;
  onSaveSetting: (key: string, value: string) => void;
}

export function AccessKeyPanel({ settings: initialSettings, lastSync, onSaveSetting }: AccessKeyPanelProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { refreshSettings } = useSettings();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newSalt, setNewSalt] = useState(initialSettings.daily_key_salt || "");
  const [platformName, setPlatformName] = useState(initialSettings.platform_name || "DNTRNG");
  const [mounted, setMounted] = useState(false);
  const [localProtectionEnabled, setLocalProtectionEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialSettings.access_key_protection_enabled !== undefined) {
      setLocalProtectionEnabled(String(initialSettings.access_key_protection_enabled) !== "false");
    }
    if (initialSettings.daily_key_salt) setNewSalt(initialSettings.daily_key_salt);
    if (initialSettings.platform_name) setPlatformName(initialSettings.platform_name);
  }, [initialSettings]);

  const protocolSalt = initialSettings.daily_key_salt || "";
  const currentDailyKey = generateDailyPassword(undefined, protocolSalt);

  const protocolSchedule = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'MMM dd, yyyy'),
        isToday: i === 0,
        key: generateDailyPassword(date, protocolSalt)
      };
    });
  }, [protocolSalt]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} committed to clipboard.` });
  };

  const handleSaveAll = async () => {
    // Audit check: Has salt changed?
    const saltChanged = newSalt !== initialSettings.daily_key_salt;
    
    onSaveSetting('daily_key_salt', newSalt);
    onSaveSetting('platform_name', platformName);
    
    // Telemetry node
    if (saltChanged) {
      trackEvent('admin_access_key_change');
    }
    
    setIsSettingsDialogOpen(false);
    setTimeout(refreshSettings, 1000);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-xl" aria-hidden="true">
          <Key className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{t('accessKey')}</span>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-[0.2em] font-mono leading-none">
              {(!mounted || !lastSync) ? "••••••••" : currentDailyKey}
            </span>
            {mounted && lastSync && (
              <button 
                onClick={() => copyToClipboard(currentDailyKey, t('accessKey'))} 
                className="text-slate-400 hover:text-primary transition-colors"
                aria-label="Copy access key to clipboard"
              >
                <Copy className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="sm:ml-4 sm:pl-4 sm:border-l border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <Switch 
          id="protection-toggle"
          checked={localProtectionEnabled} 
          onCheckedChange={(checked) => {
            setLocalProtectionEnabled(checked);
            onSaveSetting('access_key_protection_enabled', String(checked));
          }}
        />
        <Label htmlFor="protection-toggle" className="text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
          {localProtectionEnabled ? "Protected" : "Open Access"}
        </Label>
      </div>
      
      <div className="sm:ml-4 sm:pl-4 sm:border-l border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary" aria-label="System preferences">
              <Settings2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">System Preferences</DialogTitle>
              <DialogDescription className="text-slate-500">Configure global platform settings and branding.</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform Name</Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                  <Input 
                    value={platformName} 
                    onChange={(e) => setPlatformName(e.target.value)} 
                    placeholder="e.g. My Academy" 
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Protocol Secret (Salt)</Label>
                <Input 
                  value={newSalt} 
                  onChange={(e) => setNewSalt(e.target.value)} 
                  placeholder="e.g. MY-PROTOCOL-SALT" 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveAll} className="w-full h-14 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl border-none">
                <Save className="w-4 h-4 mr-2" aria-hidden="true" /> Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest gap-2" aria-label="View weekly key schedule">
              <CalendarDays className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              {t('weeklySchedule')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl dark:bg-slate-900" align="end">
            <div className="bg-slate-900 p-6 text-white"><h4 className="font-black uppercase tracking-tight">Key Schedule</h4></div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {protocolSchedule.map((item, idx) => (
                <div key={idx} className={cn("p-4 rounded-2xl flex items-center justify-between", item.isToday && "bg-primary/5")}>
                  <div>
                    <p className={cn("text-[9px] font-black uppercase", item.isToday ? "text-primary" : "text-slate-400")}>{item.date}</p>
                    <p className="text-sm font-mono font-black text-slate-900 dark:text-white tracking-widest">{item.key}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.key, "Key")} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    aria-label={`Copy key for ${item.date}`}
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
