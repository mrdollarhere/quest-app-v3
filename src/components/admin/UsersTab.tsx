"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  RefreshCcw,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { useSettings } from '@/context/settings-context';
import { Pagination } from './Pagination';
import { useRegistryFilter } from '@/hooks/useRegistryFilter';

interface UsersTabProps {
  users: any[];
  responses: any[];
  loading?: boolean;
  onEdit: (user: any) => void;
  onDelete: (email: string) => void;
  onAdd: () => void;
  onRefresh: () => void;
}

export function UsersTab({ users, responses, loading, onEdit, onDelete, onAdd, onRefresh }: UsersTabProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deleteConfirmEmail, setDeleteConfirmEmail] = React.useState<string | null>(null);
  
  // Local state for debounced search to prevent high-frequency re-renders
  const [displaySearch, setDisplaySearch] = useState("");
  
  const threshold = Number(settings.default_pass_threshold || '70');

  const userStats = useMemo(() => {
    const stats: Record<string, { count: number, passed: number, avg: number }> = {};
    
    responses.forEach(r => {
      const email = String(r['User Email'] || '').toLowerCase();
      if (!stats[email]) stats[email] = { count: 0, passed: 0, avg: 0 };
      
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      const pct = (score / total) * 100;
      
      stats[email].count++;
      if (pct >= threshold) stats[email].passed++;
      stats[email].avg += pct;
    });

    Object.keys(stats).forEach(email => {
      stats[email].avg = Math.round(stats[email].avg / stats[email].count);
    });

    return stats;
  }, [responses, threshold]);

  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: users,
    searchFields: (u) => [
      String(u.name || ''),
      String(u.email || ''),
      String(u.role || '')
    ],
    pageSize: 10,
    initialSort: { key: 'name', direction: 'asc' },
    customSort: (a, b, key, direction) => {
      let valA: any;
      let valB: any;

      const emailA = String(a.email || '').toLowerCase();
      const emailB = String(b.email || '').toLowerCase();
      const statsA = userStats[emailA] || { count: 0, avg: 0 };
      const statsB = userStats[emailB] || { count: 0, avg: 0 };

      switch (key) {
        case 'name':
          valA = String(a.name || '').toLowerCase();
          valB = String(b.name || '').toLowerCase();
          break;
        case 'role':
          valA = String(a.role || '').toLowerCase();
          valB = String(b.role || '').toLowerCase();
          break;
        case 'count':
          valA = statsA.count;
          valB = statsB.count;
          break;
        case 'avg':
          valA = statsA.avg;
          valB = statsB.avg;
          break;
        default:
          valA = (a as any)[key];
          valB = (b as any)[key];
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    }
  });

  // Registry Telemetry: Search Debounce Protocol
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(displaySearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [displaySearch, setSearchTerm]);

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

  const handleDelete = () => {
    if (deleteConfirmEmail) {
      onDelete(deleteConfirmEmail);
      setDeleteConfirmEmail(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('studentList')}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Management & Analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-80 flex items-center gap-2" role="search">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <Input 
                placeholder="Search students..." 
                aria-label="Search students by name or email"
                disabled={loading}
                className="h-12 pl-12 rounded-full bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/40 text-sm font-bold shadow-sm"
                value={displaySearch}
                onChange={(e) => setDisplaySearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh} 
              disabled={loading}
              aria-label="Refresh student list"
              className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              <RefreshCcw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin text-primary")} />
            </Button>
          </div>
          <Button onClick={onAdd} disabled={loading} className="rounded-full gap-2 font-black h-12 px-8 shadow-xl bg-primary">
            <Plus className="w-4 h-4" aria-hidden="true" /> {t('addStudent')}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <Table aria-label="Students table">
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-none">
                <TableHead 
                  scope="col"
                  className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors"
                  aria-sort={getAriaSort('name')}
                  onClick={() => !loading && handleSort('name')}
                >
                  <div className="flex items-center" aria-label="Sort by student name">{t('studentInfo')} <SortIcon column="name" /></div>
                </TableHead>
                <TableHead 
                  scope="col"
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors"
                  aria-sort={getAriaSort('role')}
                  onClick={() => !loading && handleSort('role')}
                >
                  <div className="flex items-center" aria-label="Sort by role">{t('role')} <SortIcon column="role" /></div>
                </TableHead>
                <TableHead 
                  scope="col"
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors"
                  aria-sort={getAriaSort('count')}
                  onClick={() => !loading && handleSort('count')}
                >
                  <div className="flex items-center justify-center" aria-label="Sort by tests completed">{t('testsDone')} <SortIcon column="count" /></div>
                </TableHead>
                <TableHead 
                  scope="col"
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors"
                  aria-sort={getAriaSort('avg')}
                  onClick={() => !loading && handleSort('avg')}
                >
                  <div className="flex items-center justify-center" aria-label="Sort by average score">{t('avgScore')} <SortIcon column="avg" /></div>
                </TableHead>
                <TableHead scope="col" className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-none">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-12 mx-auto rounded" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-16 mx-auto rounded" /></TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.map((u, i) => {
                const email = String(u.email || '').toLowerCase();
                const s = userStats[email] || { count: 0, passed: 0, avg: 0 };
                
                return (
                  <TableRow key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-xs shrink-0 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm"
                          aria-hidden="true"
                        >
                          {u.image_url ? (
                            <img src={u.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 dark:text-white leading-none mb-1 truncate">{u.name}</span>
                          <span className="text-xs font-medium text-slate-400 truncate">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        aria-label={`Role: ${u.role}`}
                        className={cn(
                          "font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border-none shadow-sm",
                          u.role === 'admin' ? "bg-slate-900 dark:bg-slate-700 text-white" : "bg-primary/5 text-primary"
                        )}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span id={`count-${i}`} className="font-black text-slate-700 dark:text-slate-300">{s.count}</span>
                        <span className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-widest" aria-describedby={`count-${i}`}>Sessions</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span id={`avg-${i}`} className={cn(
                          "font-black text-base",
                          s.avg >= 80 ? "text-green-600" : s.avg >= threshold ? "text-orange-600" : "text-slate-400 dark:text-slate-600"
                        )}>
                          {s.count > 0 ? `${s.avg}%` : '--'}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-widest" aria-describedby={`avg-${i}`}>Mean</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex justify-end gap-2 transition-all duration-300">
                        <Link href={`/admin/users/detail?email=${encodeURIComponent(u.email)}`} aria-label={`View details for ${u.name}`}>
                          <Button variant="ghost" size="icon" disabled={loading} title="View Profile" className="rounded-full h-10 w-10 hover:bg-primary/5 text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={loading} 
                          title={t('edit')} 
                          aria-label={`Edit details for ${u.name}`}
                          onClick={() => onEdit(u)} 
                          className="rounded-full h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={loading} 
                          title={t('delete')} 
                          aria-label={`Delete record for ${u.name}`}
                          onClick={() => setDeleteConfirmEmail(u.email)} 
                          className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && totalItems === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Users className="w-12 h-12" aria-hidden="true" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No matching students found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalItems > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirmEmail} onOpenChange={(open) => !open && !loading && setDeleteConfirmEmail(null)}>
        <AlertDialogContent className="rounded-[3rem] p-10 border-none shadow-2xl dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel disabled={loading} className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1 dark:border-slate-700 dark:text-slate-400">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl shadow-destructive/20 border-none"
            >
              {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
