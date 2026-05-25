"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({
    join_mode: 'open',
    name_whitelist: '[]',
    custom_blacklist: '[]'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/settings', { cache: 'no-store' });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...(data || {}) }));
    } catch (e) {
      console.warn("[Registry Proxy] Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
