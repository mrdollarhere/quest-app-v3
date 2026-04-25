"use client";

import React from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

/**
 * DNTRNG™ SESSION CACHE REGISTRY
 * 
 * Implements SWR with cross-navigation persistence.
 * Leverages sessionStorage for the stable tests library to enable instant hydration.
 * Includes defensive parsing to prevent "Unexpected end of JSON input" errors.
 */
export function SWRProvider({ children }: SWRProviderProps) {
  const sessionStorageProvider = () => {
    if (typeof window === 'undefined') return new Map();
    
    // Load existing cache from session storage with defensive parsing
    let cacheData = [];
    try {
      const stored = sessionStorage.getItem('swr-cache');
      if (stored && stored.trim() !== "") {
        cacheData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Cache Registry] Corrupted session cache detected. Resetting...');
      sessionStorage.removeItem('swr-cache');
    }

    const map = new Map(Array.isArray(cacheData) ? cacheData : []);

    // Persistence Protocol: Save stable cache keys on unload
    window.addEventListener('beforeunload', () => {
      // Only persist stable, non-sensitive data
      const persistentKeys = ['tests', 'settings'];
      const dataToSave = Array.from(map.entries()).filter(([key]) => 
        persistentKeys.includes(String(key))
      );
      try {
        sessionStorage.setItem('swr-cache', JSON.stringify(dataToSave));
      } catch (e) {
        console.error('[Cache Registry] Persistence failure:', e);
      }
    });

    return map;
  };

  return (
    <SWRConfig 
      value={{
        fetcher: (url: string) => fetch(url).then(res => {
          if (!res.ok) throw new Error('Registry request failed');
          return res.json();
        }),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // 1 minute
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        provider: sessionStorageProvider
      }}
    >
      {children}
    </SWRConfig>
  );
}
