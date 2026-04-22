
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Zap, 
  ArrowLeft, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  Shield,
  Diamond,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from '@/lib/api-config';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AILoader } from '@/components/ui/ai-loader';
import { useLanguage } from '@/context/language-context';

type ProfileFilter = 'all' | 'pass' | 'fail' | 'perfect';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const router = useRouter();

  const [responses, setResponses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ProfileFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const threshold = Number(settings.default_pass_threshold || '70');

  useEffect(() => {
    if (!authLoading && !user) {
      const fullPath = window.location.pathname + window.location.search;
      router.push(`/login?returnTo=${encodeURIComponent(fullPath)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!API_URL) return;
    setLoadingStats(true);
    try {
      const [respRes, testsRes] = await Promise.all([
        fetch(`${API_URL}?action=getResponses`),
        fetch(`${API_URL}?action=getTests`)
      ]);
      const respData = await respRes.json();
      const testsData = await testsRes.json();
      
      if (Array.isArray(respData)) {
        const userEmail = user?.email?.toLowerCase() || '';
        const userResponses = respData
          .filter(r => (r['User Email'] || '').toLowerCase() === userEmail)
          .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
        setResponses(userResponses);
      }
      
      if (Array.isArray(testsData)) {
        setTests(testsData);
      }
    } catch (err) {
      console.error("Failed to fetch profile registry", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Registry Lookup Map for Titles
  const testTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    tests.forEach(t => { map[t.id] = t.title; });
    return map;
  }, [tests]);

  const stats = useMemo(() => {
    if (responses.length === 0) return { avg: 0, total: 0, highest: 0, perfectCount: 0 };
    
    let totalScore = 0;
    let totalPossible = 0;
    let highest = 0;
    let perfectCount = 0;
    
    responses.forEach(r => {
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      const pct = Math.round((score / total) * 100);
      
      totalScore += score;
      totalPossible += total;
      if (pct > highest) highest = pct;
      if (pct === 100) perfectCount++;
    });

    return {
      total: responses.length,
      avg: Math.round((totalScore / (totalPossible || 1)) * 100),
      highest,
      perfectCount
    };
  }, [responses]);

  const filteredResponses = useMemo(() => {
    const filtered = responses.filter(r => {
      const pct = Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100);
      if (activeFilter === 'pass') return pct >= threshold;
      if (activeFilter === 'fail') return pct < threshold;
      if (activeFilter === 'perfect') return pct === 100;
      return true;
    });
    return filtered;
  }, [responses, activeFilter, threshold]);

  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResponses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResponses, currentPage]);

  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);

  const handleFilterChange = (filter: ProfileFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AILoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 md:px-12 selection:bg-primary selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <Link href="/tests">
          <Button variant="ghost" size="sm" className="rounded-full font-bold text-slate-400 mb-2 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white">
          
          {/* Top Section: Identity Mark */}
          <div className="p-8 border-b border-slate-100 bg-[#f9fafb] relative">
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-[#3B5BDB] rounded-r" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-[64px] h-[64px] shrink-0 rounded-[12px] bg-[#1a2340] flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-[18px] font-bold text-[#1a2340] uppercase tracking-tight leading-none">
                    {user.displayName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-medium text-slate-400">
                      {user.email}
                    </p>
                    {user.role === 'admin' && (
                      <Badge className="bg-[#3B5BDB] text-white text-[9px] font-bold px-2 py-0.5 rounded-full border-none shadow-sm h-4">
                        ADMIN
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {stats.highest === 100 && (
                      <div className="flex items-center gap-1.5 bg-[#fef9c3] text-[#854f0b] border border-[#854f0b]/30 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        Top Scorer
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="flex items-center gap-1.5 bg-[#dbeafe] text-[#1d4ed8] border border-[#1d4ed8]/30 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                        <Shield className="w-3 h-3" />
                        Admin
                      </div>
                    )}
                    {stats.perfectCount > 0 && (
                      <div className="flex items-center gap-1.5 bg-[#f3e8ff] text-[#7c3aed] border border-[#7c3aed]/30 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                        <Diamond className="w-3 h-3 fill-current" />
                        Perfect x{stats.perfectCount}
                      </div>
                    )}
                    {stats.total >= 10 && (
                      <div className="flex items-center gap-1.5 bg-[#dcfce7] text-[#15803d] border border-[#15803d]/30 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm">
                        <Check className="w-3 h-3" />
                        Consistent
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={logout} variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-200/50 transition-colors">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Row: Fractional Registry */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 bg-slate-50/50">
            <StatColumn label="Tests taken" value={stats.total} />
            <StatColumn label="Avg score" value={`${stats.avg}%`} />
            <StatColumn label="Best score" value={`${stats.highest}%`} />
            <StatColumn label="Perfect 100%" value={stats.perfectCount} highlight />
          </div>

          {/* History Section: Registry Audit */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterPill label="All" active={activeFilter === 'all'} onClick={() => handleFilterChange('all')} />
                <FilterPill label="Pass" active={activeFilter === 'pass'} onClick={() => handleFilterChange('pass')} />
                <FilterPill label="Fail" active={activeFilter === 'fail'} onClick={() => handleFilterChange('fail')} />
                <FilterPill label="Perfect" active={activeFilter === 'perfect'} onClick={() => handleFilterChange('perfect')} />
              </div>
              {loadingStats && <Zap className="w-4 h-4 text-primary animate-pulse" />}
            </div>

            <div className="space-y-3">
              {paginatedResponses.map((r, i) => {
                const pct = Math.round((Number(r.Score) / (Number(r.Total) || 1)) * 100);
                const isPerfect = pct === 100;
                const isPass = pct >= threshold;
                const testTitle = testTitleMap[r['Test ID']] || r['Test ID'];

                return (
                  <div key={i} className="group flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-lg hover:border-primary/10 transition-all">
                    {/* Score Badge */}
                    <div className={cn(
                      "w-[46px] h-[46px] shrink-0 rounded-[12px] flex items-center justify-center font-black text-white text-xs",
                      pct >= 90 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )}>
                      {pct}%
                    </div>

                    {/* Test Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                        {testTitle}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(r.Timestamp).toLocaleDateString()} • {r.Score}/{r.Total} Points
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block">
                        {isPerfect ? (
                          <StatusBadge label="Perfect" color="gold" />
                        ) : isPass ? (
                          <StatusBadge label="Pass" color="green" />
                        ) : (
                          <StatusBadge label="Fail" color="red" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Link href={`/quiz?id=${r['Test ID']}&view_result=${new Date(r.Timestamp).getTime()}`}>
                          <Button variant="outline" className="h-8 px-3 rounded-lg border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">
                            Results
                          </Button>
                        </Link>
                        <Link href={`/quiz?id=${r['Test ID']}`}>
                          <Button variant="outline" className="h-8 px-3 rounded-lg border-slate-200 text-[9px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/40 group-hover:bg-primary/5">
                            Retake <ChevronRight className="w-2.5 h-2.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredResponses.length === 0 && !loadingStats && (
                <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No sessions matched the current filter</p>
                </div>
              )}
            </div>

            {/* Pagination Layer */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg border-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                          currentPage === idx + 1 ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg border-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filteredResponses.length} total results
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
           <Link href="/">
            <Button variant="ghost" className="rounded-full text-slate-400 font-bold hover:text-primary">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatColumn({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="p-6 text-center space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
        {label}
      </p>
      <p className={cn(
        "text-xl font-black tracking-tight",
        highlight ? "text-amber-500" : "text-[#1a2340]"
      )}>
        {value}
      </p>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-[#1a2340] text-white shadow-lg" 
          : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}

function StatusBadge({ label, color }: { label: string, color: 'gold' | 'green' | 'red' }) {
  const styles = {
    gold: "bg-amber-100 text-amber-600",
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-rose-100 text-rose-600"
  };
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest whitespace-nowrap",
      styles[color]
    )}>
      {label}
    </span>
  );
}
