"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { EmptyState } from '@/components/library/EmptyState';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/tracker';

export default function TestsLibrary() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const key = 'page_view_tests' + window.location.pathname + Math.floor(Date.now() / 2000);
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent('page_view_tests');
  }, []);

  // TELEMETRY: Debounced search tracking
  useEffect(() => {
    if (!search.trim()) return;
    const handler = setTimeout(() => {
      trackEvent('test_search', { details: { query: search } });
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    API_URL ? `${API_URL}?action=getTests` : 'tests-demo',
    async (url) => {
      if (!API_URL) return DEMO_TESTS;
      const res = await fetch(url);
      const tests = await res.json();
      setLastSync(new Date());
      return Array.isArray(tests) ? tests : [];
    }
  );

  const tests = data || [];

  useEffect(() => {
    const savedView = localStorage.getItem('dntrng_test_view') as 'card' | 'list';
    if (savedView) setViewMode(savedView);
    const savedCat = localStorage.getItem('dntrng_selected_cat');
    if (savedCat) setSelectedCategory(savedCat);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    localStorage.setItem('dntrng_selected_cat', cat);
    trackEvent('test_filter_category', { details: { category: cat } });
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tests.forEach(t_item => cats.add((t_item.category || "General").trim()));
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
      if (search) return matchesSearch && matchesDifficulty;
      const cat = (t_item.category || "General").trim();
      return matchesSearch && matchesDifficulty && (selectedCategory === "All" || cat === selectedCategory);
    });
  }, [tests, search, difficultyFilter, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <LibraryHeader 
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={(mode) => { setViewMode(mode); localStorage.setItem('dntrng_test_view', mode); }}
        loading={isLoading}
        onRefresh={() => mutate()}
        lastSync={lastSync}
        isValidating={isValidating}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
        {error ? (
          <div className="max-w-xl mx-auto text-center py-32 space-y-10">
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto" />
            <h2 className="text-4xl font-black uppercase tracking-tight">Sync Failure</h2>
            <Button onClick={() => mutate()} className="h-16 px-12 rounded-full bg-slate-900">Re-initialize Connection</Button>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="px-4 pt-7 pb-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry Active</span>
                  </div>
                  <h1 className="text-[36px] font-bold text-[#1a2340] dark:text-white leading-tight">{t('chooseTest')}</h1>
                  <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-[480px] leading-relaxed font-medium">{t('testSubtitle')}</p>
                </div>
              </div>
            </section>

            {!search && (
              <nav className="px-4" aria-label="Category Selection">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={selectedCategory === cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "whitespace-nowrap px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-3",
                        selectedCategory === cat ? "bg-[#1a2340] text-white shadow-lg scale-105" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {cat}
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", selectedCategory === cat ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                        {categoryCounts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </nav>
            )}
            
            <div id="test-grid">
              {(isLoading && tests.length === 0) ? (
                <div className={cn("px-4", viewMode === 'card' ? "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4" : "flex flex-col gap-[10px]")}>
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
              ) : filteredTests.length > 0 ? (
                <div className="px-4">
                  {viewMode === 'card' ? <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4"><CardView tests={filteredTests} /></div> : <div className="flex flex-col gap-[10px]"><ListView tests={filteredTests} /></div>}
                </div>
              ) : <EmptyState onClear={() => { setSearch(""); handleCategoryChange("All"); }} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
