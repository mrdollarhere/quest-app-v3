/**
 * UsersTable.tsx
 * 
 * Purpose: Renders the administrative student registry.
 * Logic: Handles row-based identity rendering and sorting feedback.
 */

"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowUpDown, ChevronUp, ChevronDown, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Pagination } from '../Pagination';

export function UsersTable({ 
  data, 
  userStats, 
  loading, 
  threshold, 
  sortConfig, 
  handleSort, 
  onEdit, 
  onDelete, 
  pagination,
  t 
}: any) {
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4 text-primary" /> : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 border-none">
            <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
              <div className="flex items-center">{t('studentInfo')} <SortIcon column="name" /></div>
            </TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('role')}>
              <div className="flex items-center">{t('role')} <SortIcon column="role" /></div>
            </TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('count')}>
              <div className="flex items-center justify-center">{t('testsDone')} <SortIcon column="count" /></div>
            </TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('avg')}>
              <div className="flex items-center justify-center">{t('avgScore')} <SortIcon column="avg" /></div>
            </TableHead>
            <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((u: any, i: number) => {
            const s = userStats[String(u.email || '').toLowerCase()] || { count: 0, avg: 0 };
            return (
              <TableRow key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-xs shrink-0 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                      {u.image_url ? <img src={u.image_url} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-slate-900 dark:text-white leading-none mb-1 truncate">{u.name}</span>
                      <span className="text-xs font-medium text-slate-400 truncate">{u.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border-none shadow-sm", u.role === 'admin' ? "bg-slate-900 dark:bg-slate-700 text-white" : "bg-primary/5 text-primary")}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-black text-slate-700 dark:text-slate-300">{s.count}</TableCell>
                <TableCell className="text-center">
                  <span className={cn("font-black text-base", s.avg >= 80 ? "text-green-600" : s.avg >= threshold ? "text-orange-600" : "text-slate-400")}>
                    {s.count > 0 ? `${s.avg}%` : '--'}
                  </span>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Link href={`/admin/users/detail?email=${encodeURIComponent(u.email)}`}>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-primary/5 text-primary"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(u)} className="rounded-full h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800"><Edit className="w-4 h-4 text-slate-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(u.email)} className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/5"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination {...pagination} />
    </>
  );
}
