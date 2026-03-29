"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { EmptyState } from '@/components/library/EmptyState';
import { AILoader } from '@/components/ui/ai-loader';
import { Sparkles, AlertCircle, RefreshCcw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * INTELLIGENCE LIBRARY PROTOCOL
 * 
 * This component manages the retrieval and presentation of assessment modules.
 * Includes high-availability error handling and a 8s synchronization timeout.
 */
export default function TestsLibrary() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    
    // Registry Sync Protocol: 8s Safety Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?action=getTests`, { 
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("Registry Handshake Rejected");
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setTests(data);
        } else {
          setTests([]);
        }
      } else {
        // Fallback for isolated environments
        setTests(DEMO_TESTS);
      }
      setLastSync(new Date());
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Registry Sync Violation:", err);
      
      if (err.name === 'AbortError') {
        setError("The registry request timed out (8s limit exceeded). Ensure the bridge is responding.");
      } else {
        setError("The Registry Bridge is currently unresponsive or misconfigured.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(t => 
    (t.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (t.category?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (t.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 selection:bg-primary selection:text-white flex flex-col transition-colors duration-300">
      <LibraryHeader 
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loading={loading}
        onRefresh={fetchTests}
        lastSync={lastSync}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24">
        {loading ? (
          <div className="py-40">
            <AILoader />
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center py-32 space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ring-8 ring-white dark:ring-slate-900">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Sync Failure</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                {error}
              </p>
            </div>
            <Button 
              onClick={fetchTests}
              className="h-16 px-12 rounded-full bg-slate-900 dark:bg-primary font-black uppercase text-xs tracking-widest gap-3 shadow-2xl hover:scale-105 transition-all border-none"
            >
              <RefreshCcw className="w-4 h-4" />
              Re-initialize Connection
            </Button>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-40 animate-in fade-in slide-in-from-bottom-4 duration-1000 bg-white dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 mx-4">
            <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Database className="w-10 h-10 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registry Clean</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium text-lg">No assessments available yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {!search && (
              <div className="px-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Available Modules</h2>
                <p className="text-slate-400 dark:text-slate-500 font-bold tracking-widest text-[10px] uppercase">Select a protocol to begin your session</p>
              </div>
            )}
            
            {filteredTests.length > 0 ? (
              viewMode === 'card' ? (
                <CardView tests={filteredTests} />
              ) : (
                <ListView tests={filteredTests} />
              )
            ) : (
              <EmptyState onClear={() => setSearch("")} />
            )}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
            <div className="bg-slate-900 dark:bg-primary p-1.5 rounded-lg">
              <Sparkles className="text-primary dark:text-white w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">DNTRNG</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-700">
            GLOBAL ASSESSMENT REGISTRY • ENCRYPTED SESSION
          </p>
        </div>
      </footer>
    </div>
  );
}