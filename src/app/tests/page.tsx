"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { EmptyState } from '@/components/library/EmptyState';
import { CategorySection } from '@/components/library/CategorySection';
import { AILoader } from '@/components/ui/ai-loader';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';

/**
 * INTELLIGENCE LIBRARY PROTOCOL - CATEGORICAL REFACTOR
 * 
 * This component manages the retrieval and grouped presentation of assessment modules.
 */
export default function TestsLibrary() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dntrng_test_view') as 'card' | 'list';
    if (saved && (saved === 'card' || saved === 'list')) {
      setViewMode(saved);
    }
    fetchTests();
  }, []);

  const handleViewChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('dntrng_test_view', mode);
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

  const filteredTests = useMemo(() => {
    return tests.filter(t_item => {
      const title = String(t_item.title || "");
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || String(t_item.difficulty).toLowerCase() === difficultyFilter.toLowerCase();
      const matchesCategory = categoryFilter === "all" || String(t_item.category).toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [tests, search, difficultyFilter, categoryFilter]);

  // CATEGORY GROUPING ENGINE
  const groupedTests = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    filteredTests.forEach(test => {
      const cat = (test.category || "General").trim();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(test);
    });

    const getLevelScore = (cat: string) => {
      const match = cat.match(/(LV|Level)\s*(\d+)/i);
      return match ? parseInt(match[2]) : 999;
    };

    // Sort categories: LV1 -> LV2 -> LV3 -> Alphabetical
    return Object.keys(groups)
      .sort((a, b) => {
        const scoreA = getLevelScore(a);
        const scoreB = getLevelScore(b);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.localeCompare(b);
      })
      .map(name => ({
        name,
        tests: groups[name]
      }));
  }, [filteredTests]);

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
          <div className="space-y-12">
            {!search && (
              <div className="px-4">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">{t('chooseTest')}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">{t('testSubtitle')}</p>
              </div>
            )}
            
            {groupedTests.length > 0 ? (
              <div className="space-y-8">
                {groupedTests.map((group, idx) => (
                  <CategorySection 
                    key={group.name}
                    name={group.name}
                    tests={group.tests}
                    viewMode={viewMode}
                    isDefaultExpanded={idx === 0 || search.length > 0}
                    isSearching={search.length > 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onClear={() => { setSearch(""); setDifficultyFilter("all"); setCategoryFilter("all"); }} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
