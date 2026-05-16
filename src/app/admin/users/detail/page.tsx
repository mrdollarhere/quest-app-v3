/**
 * detail/page.tsx (Admin)
 * 
 * Purpose: Diagnostic detail terminal for individual student nodes.
 * Refactored: v19.0 (CEP) - Extracted sub-components to reduce file complexity.
 */

"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Search, Database, Activity, Trophy, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { AILoader } from '@/components/ui/ai-loader';
import { useSettings } from '@/context/settings-context';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { Pagination } from '@/components/admin/Pagination';
import { trackEvent } from '@/lib/tracker';

// Modular Sub-components (v19.0)
import { UserIdentityCard } from '@/components/admin/users/UserIdentityCard';
import { UserHistoryTable } from '@/components/admin/users/UserHistoryTable';

function UserDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();
  const email = searchParams.get('email') || "";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const threshold = Number(settings.default_pass_threshold || '70');

  useEffect(() => {
    const fetchData = async () => {
      if (!email) { setLoading(false); return; }
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([
          fetch('/api/proxy/admin/users'),
          fetch('/api/proxy/admin/responses')
        ]);
        const uData = await uRes.json();
        const rData = await rRes.json();
        const foundUser = uData.find((u: any) => String(u.email || "").toLowerCase() === email.toLowerCase());
        const userResponses = rData
          .filter((r: any) => String(r['User Email'] || "").toLowerCase() === email.toLowerCase())
          .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
        setUser(foundUser);
        setResponses(userResponses);
        if (foundUser) trackEvent('admin_student_view', { details: { studentId: email } });
      } catch (err) {
        toast({ variant: "destructive", title: "Sync Error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email, toast]);

  const { searchTerm, setSearchTerm, currentPage, setCurrentPage, paginatedData, totalItems, pageSize } = useRegistryFilter({
    data: responses,
    searchFields: (r) => [String(r['Test ID'] || ''), String(r.Mode || '')],
    pageSize: 10
  });

  const stats = useMemo(() => {
    if (responses.length === 0) return { total: 0, avg: 0, best: 0 };
    const percentages = responses.map(r => (Number(r.Score) / (Number(r.Total) || 1)) * 100);
    return {
      total: responses.length,
      avg: Math.round(percentages.reduce((a, b) => a + b, 0) / (responses.length || 1)),
      best: Math.round(Math.max(...percentages))
    };
  }, [responses]);

  if (loading) return <div className="py-32"><AILoader /></div>;
  if (!user) return <div className="text-center py-32"><Button onClick={() => router.back()}>Return to Registry</Button></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Button variant="ghost" onClick={() => router.push('/admin/users')} className="rounded-full font-bold h-12 px-6 shadow-sm border border-slate-100">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <UserIdentityCard user={user} />
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatSmall icon={Database} label="Sessions" value={stats.total} color="blue" />
            <StatSmall icon={Activity} label="Mean Score" value={`${stats.avg}%`} color="green" />
            <StatSmall icon={Trophy} label="Peak Record" value={`${stats.best}%`} color="purple" />
          </div>

          <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 min-h-[600px] flex flex-col border dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Attempt History</CardTitle>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search results..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-11 rounded-full bg-white border-none ring-1 ring-slate-200" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {totalItems > 0 ? (
                <div className="flex flex-col h-full">
                  <UserHistoryTable data={paginatedData} threshold={threshold} />
                  <div className="mt-auto">
                    <Pagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 opacity-20"><Filter className="w-12 h-12 mb-4" /><p className="font-black uppercase text-xs">No Records Found</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border dark:border-slate-800">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl border-2 ${colors[color]}`}><Icon className="w-6 h-6" /></div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function UserDetailPage() {
  return <Suspense fallback={<div className="py-32"><AILoader /></div>}><UserDetailContent /></Suspense>;
}
