"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { EmptyState } from '@/components/library/EmptyState';
import { AILoader } from '@/components/ui/ai-loader';
import { Sparkles } from 'lucide-react';

export default function TestsLibrary() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}?action=getTests`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTests(data);
        } else {
          setTests(DEMO_TESTS);
        }
      } else {
        setTests(DEMO_TESTS);
      }
      setLastSync(new Date());
    } catch (err) {
      console.error("Failed to fetch tests", err);
      setTests(DEMO_TESTS);
      setLastSync(new Date()); 
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
    <div className="min-h-screen bg-slate-50/30 selection:bg-primary selection:text-white flex flex-col">
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
        {loading && tests.length === 0 ? (
          <div className="py-40">
            <AILoader />
          </div>
        ) : (
          <div className="space-y-12">
            {!search && (
              <div className="px-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Available Modules</h2>
                <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Select a protocol to begin your session</p>
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

      <footer className="bg-white border-t py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Sparkles className="text-primary w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">DNTRNG</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
            GLOBAL ASSESSMENT REGISTRY • ENCRYPTED SESSION
          </p>
        </div>
      </footer>
    </div>
  );
}
