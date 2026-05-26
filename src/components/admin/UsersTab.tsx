/**
 * UsersTab.tsx
 * 
 * Purpose: Main container for student node management.
 * Refactored: v19.0.1 - Implementation of Defensive Registry Shield.
 */

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import { UsersTable } from './users/UsersTable';

export function UsersTab({ users, responses, loading, onEdit, onDelete, onAdd, onRefresh }: any) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(null);
  const [displaySearch, setDisplaySearch] = useState("");
  
  const threshold = Number(settings.default_pass_threshold || '70');

  const userStats = useMemo(() => {
    const stats: Record<string, { count: number, avg: number }> = {};
    const safeResponses = Array.isArray(responses) ? responses : [];
    
    safeResponses.forEach((r: any) => {
      const email = String(r['User Email'] || '').toLowerCase();
      if (!stats[email]) stats[email] = { count: 0, avg: 0 };
      stats[email].count++;
      stats[email].avg += (Number(r.Score) / (Number(r.Total) || 1)) * 100;
    });
    
    Object.keys(stats).forEach(e => stats[e].avg = Math.round(stats[e].avg / stats[e].count));
    return stats;
  }, [responses]);

  const { searchTerm, setSearchTerm, sortConfig, handleSort, currentPage, setCurrentPage, paginatedData, totalItems, pageSize } = useRegistryFilter({
    data: Array.isArray(users) ? users : [],
    searchFields: (u: any) => [u.name, u.email, u.role],
    pageSize: 10,
    initialSort: { key: 'name', direction: 'asc' }
  });

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(displaySearch), 300);
    return () => clearTimeout(handler);
  }, [displaySearch, setSearchTerm]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div><h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('studentList')}</h2><p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Management & Analytics</p></div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-80 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search students..." disabled={loading} className="h-12 pl-12 rounded-full bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800" value={displaySearch} onChange={(e) => setDisplaySearch(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-12 w-12"><RefreshCcw className={cn("w-4 h-4", loading && "animate-spin text-primary")} /></Button>
          </div>
          <Button onClick={onAdd} disabled={loading} className="rounded-full gap-2 font-black h-12 px-8 shadow-xl bg-primary">{t('addStudent')}</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <UsersTable 
            data={paginatedData} userStats={userStats} loading={loading} threshold={threshold}
            sortConfig={sortConfig} handleSort={handleSort} onEdit={onEdit} onDelete={setDeleteConfirmEmail}
            pagination={{ currentPage, totalItems, pageSize, onPageChange: setCurrentPage }} t={t}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirmEmail} onOpenChange={(open) => !open && setDeleteConfirmEmail(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader><AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{t('confirmDeleteTitle')}</AlertDialogTitle><AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{t('confirmDeleteDesc')}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if(deleteConfirmEmail) onDelete(deleteConfirmEmail); setDeleteConfirmEmail(null); }} className="h-14 rounded-full bg-destructive text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl border-none">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
