/**
 * src/components/admin/TestsTab.tsx
 * 
 * Purpose: Master control terminal for the assessment module library.
 * Key components: TestsTable, TestsGrid, EventsFilterBar.
 * Props: Standard administrative crud handlers.
 */

"use client";

import React, { useState } from 'react';
import { Plus, Search, LayoutGrid, List, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Sub-components per Protocol v18.9
import { TestsTable } from './tests/TestsTable';

export function TestsTab({ tests, loading, onEdit, onDelete, onManageQuestions, onViewAnalytics, onAdd, onRefresh }: any) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string, title: string } | null>(null);

  const { 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    paginatedData, 
    totalItems, 
    pageSize,
    sortConfig,
    handleSort 
  } = useRegistryFilter({
    data: tests,
    searchFields: (test: any) => [test.title, test.id, test.category],
    initialSort: { key: 'title', direction: 'asc' }
  });

  const handleDeleteTrigger = (id: string) => {
    const item = tests.find((test: any) => test.id === id);
    if (item) {
      setDeleteConfirmItem({ id, title: item.title });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      onDelete(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border shadow-sm dark:border-slate-800">
        <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase">{t('testLibrary')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('searchTests')} className="pl-10 rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-full h-11 w-11 dark:border-slate-700"><RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /></Button>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border dark:border-slate-700">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className={cn("rounded-full h-9 w-9", viewMode === 'list' && "bg-white dark:bg-slate-700 shadow-sm")}><List className="w-4 h-4" /></Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} className={cn("rounded-full h-9 w-9", viewMode === 'card' && "bg-white dark:bg-slate-700 shadow-sm")}><LayoutGrid className="w-4 h-4" /></Button>
          </div>
          <Button onClick={onAdd} className="rounded-full h-11 px-6 gap-2 font-black shadow-lg bg-primary"><Plus className="w-4 h-4" /> {t('newTest')}</Button>
        </div>
      </div>

      <TestsTable 
        data={paginatedData} 
        loading={loading} 
        onEdit={onEdit} 
        onDelete={handleDeleteTrigger} 
        onManageQuestions={onManageQuestions} 
        onViewAnalytics={onViewAnalytics} 
        t={t}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{ currentPage, totalItems, pageSize, onPageChange: setCurrentPage }}
      />

      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Delete Test?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              This action cannot be undone. All questions and session data for <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmItem?.title}"</span> will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1 dark:border-slate-700 dark:text-slate-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl shadow-destructive/20 border-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
