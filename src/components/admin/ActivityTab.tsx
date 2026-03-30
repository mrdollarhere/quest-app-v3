"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
  Search, 
  LogIn, 
  LogOut, 
  Clock,
  Globe,
  Smartphone,
  RefreshCcw,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';
import { Pagination } from './Pagination';
import { Button } from "@/components/ui/button";
import { useRegistryFilter } from '@/hooks/useRegistryFilter';

interface ActivityTabProps {
  activities: any[];
  loading?: boolean;
  onRefresh: () => void;
}

export function ActivityTab({ activities, loading, onRefresh }: ActivityTabProps) {
  const { t } = useLanguage();
  
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalItems,
    pageSize
  } = useRegistryFilter({
    data: activities,
    searchFields: (a) => [
      String(a['User Name'] || ''),
      String(a['User Email'] || ''),
      String(a['IP Address'] || ''),
      String(a.Event || '')
    ]
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-end px-2">
        <div className="relative w-full md:w-80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search operator or IP..." 
              className="h-12 pl-12 rounded-full bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/40 text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh} 
            className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          >
            <RefreshCcw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin text-primary")} />
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-none">
                <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">{t('timestamp')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">{t('student')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">{t('event')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">{t('ipAddress')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">{t('device')}</TableHead>
                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((a, i) => {
                const isLogin = String(a.Event).toLowerCase() === 'login';
                
                return (
                  <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group border-b border-slate-50 dark:border-slate-800 last:border-none">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span className="text-[11px] tabular-nums">
                          {new Date(a.Timestamp).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary text-xs shrink-0">
                          {String(a['User Name'] || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 dark:text-white leading-none mb-1 truncate">{a['User Name']}</span>
                          <span className="text-[10px] font-bold text-slate-400 truncate">{a['User Email']}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-black text-[10px] uppercase tracking-widest",
                          isLogin ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-100 bg-slate-50 text-slate-500"
                        )}>
                          {isLogin ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {a.Event}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                        <Globe className="w-3 h-3 text-slate-300" />
                        {a['IP Address'] || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]" title={a['Device']}>
                          {a['Device'] || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <Badge variant="outline" className="rounded-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase px-3">
                        Verified
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {totalItems === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center bg-slate-50/20 dark:bg-slate-900/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History className="w-12 h-12" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No activity logs detected</p>
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
    </div>
  );
}
