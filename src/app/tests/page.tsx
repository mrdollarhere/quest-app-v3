"use client";

import React, { useState, useEffect } from 'react';
import { Database, Loader2 } from "lucide-react";
import { API_URL } from '@/lib/api-config';
import { AVAILABLE_TESTS as DEMO_TESTS } from '@/app/lib/demo-data';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { CardView } from '@/components/library/CardView';
import { ListView } from '@/components/library/ListView';
import { EmptyState } from '@/components/library/EmptyState';

export default function TestsLibrary() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error("Failed to fetch tests", err);
      setTests(DEMO_TESTS);
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
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white flex flex-col">
      <LibraryHeader 
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loading={loading}
        onRefresh={fetchTests}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-20 h-20 mb-6">
              <Loader2 className="w-20 h-20 animate-spin text-primary absolute top-0 left-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-8 h-8 text-slate-200" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Syncing DNTRNG™ Modules</p>
          </div>
        ) : (
          <>
            {filteredTests.length > 0 ? (
              viewMode === 'card' ? (
                <CardView tests={filteredTests} />
              ) : (
                <ListView tests={filteredTests} />
              )
            ) : (
              <EmptyState onClear={() => setSearch("")} />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            © {new Date().getFullYear()} DNTRNG™ PLATFORM • CORE REGISTRY ACCESS
          </p>
        </div>
      </footer>
    </div>
  );
}
