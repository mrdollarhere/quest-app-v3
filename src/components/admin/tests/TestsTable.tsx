/**
 * TestsTable.tsx
 * 
 * Purpose: Renders the administrative test library in a compact list view.
 * Used by: src/components/admin/TestsTab.tsx
 */

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, FileEdit, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Pagination } from '../Pagination';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';

export function TestsTable({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onManageQuestions, 
  onViewAnalytics, 
  t, 
  pagination,
  sortConfig,
  onSort
}: any) {
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" aria-hidden="true" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" aria-hidden="true" /> 
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" aria-hidden="true" />;
  };

  const getAriaSort = (column: string) => {
    if (sortConfig.key !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] border dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none">
            <TableHead 
              className="px-8 py-5 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:text-primary transition-colors"
              aria-sort={getAriaSort('id')}
              onClick={() => onSort('id')}
            >
              <div className="flex items-center">ID <SortIcon column="id" /></div>
            </TableHead>
            <TableHead 
              className="font-black uppercase text-[10px] tracking-widest px-8 cursor-pointer hover:text-primary transition-colors"
              aria-sort={getAriaSort('title')}
              onClick={() => onSort('title')}
            >
              <div className="flex items-center">Title <SortIcon column="title" /></div>
            </TableHead>
            <TableHead 
              className="font-black uppercase text-[10px] tracking-widest px-8 text-center cursor-pointer hover:text-primary transition-colors"
              aria-sort={getAriaSort('questions_count')}
              onClick={() => onSort('questions_count')}
            >
              <div className="flex items-center justify-center">Items <SortIcon column="questions_count" /></div>
            </TableHead>
            <TableHead 
              className="font-black uppercase text-[10px] tracking-widest px-8 cursor-pointer hover:text-primary transition-colors"
              aria-sort={getAriaSort('category')}
              onClick={() => onSort('category')}
            >
              <div className="flex items-center">Category <SortIcon column="category" /></div>
            </TableHead>
            <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t_item: any) => (
            <TableRow key={t_item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800 last:border-none">
              <TableCell className="px-8 py-5"><Badge variant="outline" className="font-mono text-[10px] bg-slate-50/50 dark:bg-slate-800 dark:border-slate-700">{t_item.id}</Badge></TableCell>
              <TableCell className="px-8 font-black text-slate-700 dark:text-slate-200">{t_item.title}</TableCell>
              <TableCell className="px-8 text-center font-bold text-slate-500 dark:text-slate-400">{t_item.questions_count ?? "---"}</TableCell>
              <TableCell className="px-8"><Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase tracking-wider">{t_item.category || 'General'}</Badge></TableCell>
              <TableCell className="px-8 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button variant="ghost" size="sm" onClick={() => onViewAnalytics(t_item)} className="rounded-full text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5"><BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Analytics</Button>
                  <Button variant="ghost" size="sm" onClick={() => onManageQuestions(t_item.id)} className="rounded-full text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800"><FileEdit className="w-3.5 h-3.5 mr-1.5" /> {t('questions')}</Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t_item)} className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t_item.id)} className="rounded-full h-8 w-8 text-destructive hover:bg-rose-50 dark:hover:bg-rose-900/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination {...pagination} />
    </Card>
  );
}
