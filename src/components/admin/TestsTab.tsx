"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronRight,
  Clock,
  ListChecks,
  CheckCircle2,
  FileEdit
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from './Pagination';

interface TestsTabProps {
  tests: any[];
  loading?: boolean;
  onEdit: (test: any) => void;
  onDelete: (id: string) => void;
  onManageQuestions: (id: string) => void;
  onAdd: () => void;
}

export function TestsTab({ tests, loading, onEdit, onDelete, onManageQuestions, onAdd }: TestsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { t } = useLanguage();

  const filtered = tests.filter(t => 
    (String(t.title || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (String(t.id || "")).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedTests = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border shadow-sm dark:border-slate-800">
        <div>
          <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase">{t('testLibrary')}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('searchTests')} 
              className="pl-10 rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border dark:border-slate-700">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('list')}
              className={cn("rounded-full h-9 w-9", viewMode === 'list' && "bg-white dark:bg-slate-700 shadow-sm")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
              size="icon" 
              onClick={() => setViewMode('card')}
              className={cn("rounded-full h-9 w-9", viewMode === 'card' && "bg-white dark:bg-slate-700 shadow-sm")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={onAdd} className="rounded-full h-11 px-6 gap-2 font-black shadow-lg bg-primary">
            <Plus className="w-4 h-4" /> {t('newTest')}
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] border dark:border-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-none">
                    <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">{t('id')}</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest px-8 text-slate-400">{t('title')}</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest px-8 text-center text-slate-400">Items</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest px-8 text-slate-400">{t('category')}</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest px-8 text-center text-slate-400">Status</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest px-8 text-right text-slate-400">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-none">
                        <TableCell className="px-8 py-6"><Skeleton className="h-4 w-12 rounded" /></TableCell>
                        <TableCell className="px-8 py-6"><Skeleton className="h-5 w-48 rounded" /></TableCell>
                        <TableCell className="px-8 py-6"><Skeleton className="h-5 w-12 mx-auto rounded" /></TableCell>
                        <TableCell className="px-8 py-6"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell className="px-8 py-6"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedTests.map((t_item, i) => (
                    <TableRow key={i} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <TableCell className="px-8 py-5">
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800 rounded-md border-slate-200 dark:border-slate-700">
                          {t_item.id}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 font-black text-slate-700 dark:text-slate-200">{t_item.title}</TableCell>
                      <TableCell className="px-8 text-center font-bold text-slate-500 dark:text-slate-400">
                        {t_item.questions_count ?? "---"}
                      </TableCell>
                      <TableCell className="px-8">
                        <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-wider px-3 rounded-full bg-primary/5 text-primary border-none">
                          {t_item.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-center">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none text-[9px] font-black uppercase px-3 py-1 rounded-full">
                          Published
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button variant="ghost" size="sm" onClick={() => onManageQuestions(t_item.id)} className="rounded-full text-primary font-black text-xs hover:bg-primary/5">
                            <FileEdit className="w-4 h-4 mr-1.5" /> {t('questions')}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(t_item)} className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(t_item.id)} className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/5">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!loading && filtered.length === 0 && (
                <div className="py-24 text-center">
                  <p className="font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{t('noTests')}</p>
                </div>
              )}
              {!loading && filtered.length > 0 && (
                <Pagination 
                  currentPage={currentPage}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 flex flex-col border dark:border-slate-800">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader className="flex-1 pb-2">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Skeleton className="h-4 w-12 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                    <Skeleton className="h-7 w-3/4 rounded mt-2" />
                    <Skeleton className="h-4 w-full rounded mt-4" />
                    <Skeleton className="h-4 w-5/6 rounded mt-2" />
                  </CardHeader>
                  <CardFooter className="pt-0 p-4 mt-auto">
                    <Skeleton className="h-12 w-full rounded-full" />
                  </CardFooter>
                </Card>
              ))
            ) : paginatedTests.map((t_item, i) => (
              <Card key={i} className="group overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900 flex flex-col border dark:border-slate-800">
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={t_item.image_url || `https://picsum.photos/seed/${t_item.id}/800/450`} 
                    alt={t_item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/95 dark:bg-slate-900/95 text-primary hover:bg-white shadow-xl border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                      {t_item.category || "General"}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-2xl p-2 w-48 shadow-2xl border-none dark:bg-slate-900 dark:border dark:border-slate-800" align="end">
                        <DropdownMenuItem onClick={() => onEdit(t_item)} className="rounded-xl font-bold p-3 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteConfirmId(t_item.id)} className="rounded-xl font-bold p-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardHeader className="flex-1 pb-2">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-tighter opacity-50 px-2 rounded-md dark:border-slate-700">
                      {t_item.id}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t_item.difficulty || 'Easy'}</span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {t_item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 font-medium text-slate-500 dark:text-slate-400 text-sm">
                    {t_item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-primary opacity-40" />
                      <span>{t_item.duration || '15m'} Limit</span>
                    </div>
                    <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary opacity-40" />
                      <span>Live Sync</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 p-4 mt-auto">
                  <Button 
                    onClick={() => onManageQuestions(t_item.id)}
                    className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-lg group-hover:shadow-primary/20 transition-all hover:scale-[1.02] bg-primary"
                  >
                    {t('questions')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {!loading && filtered.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden border dark:border-slate-800">
              <Pagination 
                currentPage={currentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </Card>
          )}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <p className="font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{t('noTests')}</p>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
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
            <AlertDialogCancel className="h-14 rounded-full border-2 font-black uppercase text-xs tracking-widest flex-1 dark:border-slate-700 dark:text-slate-400">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest flex-1 shadow-xl shadow-destructive/20 border-none"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
