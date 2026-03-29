"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { EmptyState } from '@/components/library/EmptyState';
import { AILoader } from '@/components/ui/ai-loader';
import { Sparkles, AlertCircle, RefreshCcw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

/**
 * INTELLIGENCE LIBRARY PROTOCOL
 * 
 * This component manages the retrieval and presentation of assessment modules.
 * Includes high-availability error handling and a 8s synchronization timeout.
 */
export default function TestsLibrary() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
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

  const filteredTests = useMemo(() => {
    return tests.filter(t_item => {
      const matchesSearch = 
        (t_item.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
        (t_item.category?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (t_item.description?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === "all" || 
        (t_item.difficulty?.toLowerCase() || "") === difficultyFilter.toLowerCase();
      
      return matchesSearch && matchesDifficulty;
    });
  }, [tests, search, difficultyFilter]);

  const difficultyOptions = ["all", "beginner", "easy", "medium", "hard"];

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
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
        ) : (
          <div className="space-y-12">
            {!search && (
              <div className="space-y-10">
                <div className="px-4">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">{t('chooseTest')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">{t('testSubtitle')}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-3 px-4">
                  {difficultyOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setDifficultyFilter(opt)}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2",
                        difficultyFilter === opt 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {t(opt)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {filteredTests.length > 0 ? (
              viewMode === 'card' ? (
                <CardView tests={filteredTests} />
              ) : (
                <ListView tests={filteredTests} />
              )
            ) : (
              <EmptyState onClear={() => { setSearch(""); setDifficultyFilter("all"); }} />
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
