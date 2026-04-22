"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { EmptyState } from '@/components/library/EmptyState';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { AILoader } from '@/components/ui/ai-loader';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';

/**
 * INTELLIGENCE LIBRARY PROTOCOL - TABBED REFACTOR
 * 
 * This component manages the retrieval and grouped presentation of assessment modules
 * using a horizontal category selector.
 */
export default function TestsLibrary() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const savedView = localStorage.getItem('dntrng_test_view') as 'card' | 'list';
    if (savedView && (savedView === 'card' || savedView === 'list')) {
      setViewMode(savedView);
    }
    const savedCat = localStorage.getItem('dntrng_selected_cat');
    if (savedCat) {
      setSelectedCategory(savedCat);
    }
    fetchTests();
  }, []);

  const handleViewChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('dntrng_test_view', mode);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    localStorage.setItem('dntrng_selected_cat', cat);
  };

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("Timeout"), 8000);

    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?action=getTests`, { 
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Registry Handshake Rejected");
        const data = await res.json();
        setTests(Array.isArray(data) ? data : []);
      } else {
        setTests(DEMO_TESTS);
      }
      setLastSync(new Date());
    } catch (err: any) {
      clearTimeout(timeoutId);
      setError("The Registry Bridge is currently unresponsive or misconfigured.");
    } finally {
      setLoading(false);
    }
  };

  // Search Override Protocol: Switch to "All" when searching
  useEffect(() => {
    if (search && selectedCategory !== "All") {
      setSelectedCategory("All");
    }
  }, [search]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tests.forEach(t_item => {
      const cat = (t_item.category || "General").trim();
      cats.add(cat);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [tests]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All": tests.length };
    tests.forEach(t_item => {
      const cat = (t_item.category || "General").trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter(t_item => {
      const title = String(t_item.title || "");
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || String(t_item.difficulty).toLowerCase() === difficultyFilter.toLowerCase();
      
      // When searching, show matches from all categories
      if (search) return matchesSearch && matchesDifficulty;

      const cat = (t_item.category || "General").trim();
      const matchesCategory = selectedCategory === "All" || cat === selectedCategory;
      
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [tests, search, difficultyFilter, selectedCategory]);

  const getTabColor = (cat: string) => {
    const n = cat.toUpperCase();
    if (cat === "All") return "#1a2340";
    if (n.includes("LV1")) return "#22C55E";
    if (n.includes("LV2")) return "#3B5BDB";
    if (n.includes("LV3")) return "#7C3AED";
    return "#6B7280";
  };

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <LibraryHeader 
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={handleViewChange}
        loading={loading}
        onRefresh={fetchTests}
        lastSync={lastSync}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
        {loading ? (
          <div className="py-40"><AILoader /></div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center py-32 space-y-10">
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto" />
            <h2 className="text-4xl font-black uppercase tracking-tight">Sync Failure</h2>
            <Button onClick={fetchTests} className="h-16 px-12 rounded-full bg-slate-900">Re-initialize Connection</Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Redesigned Hero Section */}
            <div className="px-4 pt-7 pb-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry Active</span>
                  </div>
                  
                  <h1 className="text-[36px] font-bold text-[#1a2340] dark:text-white leading-tight">
                    {t('chooseTest')}
                  </h1>
                  
                  <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-[480px] leading-relaxed font-medium">
                    {t('testSubtitle')}
                  </p>

                  <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium pt-1">
                    <span>{tests.length} tests available</span>
                    <span className="opacity-30">•</span>
                    <span>Start immediately</span>
                  </div>
                </div>
                
                <div className="hidden md:block">
                   <span className="text-[80px] font-black text-[#1a2340] opacity-[0.06] select-none leading-none tabular-nums">
                     {tests.length.toString().padStart(2, '0')}
                   </span>
                </div>
              </div>
            </div>

            {/* Category Tab Selector - Separated from Hero Spacing */}
            {!search && (
              <div className="px-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    const color = getTabColor(cat);
                    const count = categoryCounts[cat] || 0;
                    
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={cn(
                          "whitespace-nowrap px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-3",
                          isActive 
                            ? "text-white shadow-lg scale-105" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                        )}
                        style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                      >
                        {cat}
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {filteredTests.length > 0 ? (
              <div className="animate-in fade-in duration-700 px-4">
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    <CardView tests={filteredTests} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-[10px]">
                    <ListView tests={filteredTests} />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState onClear={() => { setSearch(""); setDifficultyFilter("all"); setSelectedCategory("All"); }} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
