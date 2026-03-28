"use client";

import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';

interface UsersTabProps {
  users: any[];
  responses: any[];
  onEdit: (user: any) => void;
  onDelete: (email: string) => void;
  onAdd: () => void;
}

type SortConfig = {
  key: 'name' | 'role' | 'count' | 'avg';
  direction: 'asc' | 'desc' | null;
};

export function UsersTab({ users, responses, onEdit, onDelete, onAdd }: UsersTabProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  
  const userStats = useMemo(() => {
    const stats: Record<string, { count: number, passed: number, avg: number }> = {};
    
    responses.forEach(r => {
      const email = String(r['User Email'] || '').toLowerCase();
      if (!stats[email]) stats[email] = { count: 0, passed: 0, avg: 0 };
      
      const score = Number(r.Score) || 0;
      const total = Number(r.Total) || 1;
      const pct = (score / total) * 100;
      
      stats[email].count++;
      if (pct >= 70) stats[email].passed++;
      stats[email].avg += pct;
    });

    Object.keys(stats).forEach(email => {
      stats[email].avg = Math.round(stats[email].avg / stats[email].count);
    });

    return stats;
  }, [responses]);

  const handleSort = (key: SortConfig['key']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedUsers = useMemo(() => {
    let result = [...users];

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        String(u.name || '').toLowerCase().includes(term) ||
        String(u.email || '').toLowerCase().includes(term)
      );
    }

    // Sorting Logic
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        const emailA = String(a.email || '').toLowerCase();
        const emailB = String(b.email || '').toLowerCase();
        const statsA = userStats[emailA] || { count: 0, avg: 0 };
        const statsB = userStats[emailB] || { count: 0, avg: 0 };

        switch (sortConfig.key) {
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
            return 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, sortConfig, userStats]);

  const SortIcon = ({ column }: { column: SortConfig['key'] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" /> 
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t('studentList')}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Management & Analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="h-12 pl-12 rounded-full bg-white border-none ring-1 ring-slate-100 focus:ring-primary/40 text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={onAdd} className="rounded-full gap-2 font-black h-12 px-8 shadow-xl bg-primary">
            <Plus className="w-4 h-4" /> {t('addStudent')}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                <TableHead 
                  className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">{t('studentInfo')} <SortIcon column="name" /></div>
                </TableHead>
                <TableHead 
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">{t('role')} <SortIcon column="role" /></div>
                </TableHead>
                <TableHead 
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('count')}
                >
                  <div className="flex items-center justify-center">{t('testsDone')} <SortIcon column="count" /></div>
                </TableHead>
                <TableHead 
                  className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('avg')}
                >
                  <div className="flex items-center justify-center">{t('avgScore')} <SortIcon column="avg" /></div>
                </TableHead>
                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedUsers.map((u, i) => {
                const email = String(u.email || '').toLowerCase();
                const s = userStats[email] || { count: 0, passed: 0, avg: 0 };
                
                return (
                  <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-primary text-xs shrink-0 overflow-hidden border-2 border-white shadow-sm">
                          {u.image_url ? (
                            <img src={u.image_url} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 leading-none mb-1 truncate">{u.name}</span>
                          <span className="text-xs font-medium text-slate-400 truncate">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border-none shadow-sm",
                        u.role === 'admin' ? "bg-slate-900 text-white" : "bg-primary/5 text-primary"
                      )}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-700">{s.count}</span>
                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Sessions</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "font-black text-base",
                          s.avg >= 80 ? "text-green-600" : s.avg >= 50 ? "text-orange-600" : "text-slate-400"
                        )}>
                          {s.count > 0 ? `${s.avg}%` : '--'}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Mean</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex justify-end gap-2 transition-all duration-300">
                        <Link href={`/admin/users/detail?email=${encodeURIComponent(u.email)}`}>
                          <Button variant="ghost" size="icon" title="View Profile" className="rounded-full h-10 w-10 hover:bg-primary/5 text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" title={t('edit')} onClick={() => onEdit(u)} className="rounded-full h-10 w-10 hover:bg-slate-100">
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('delete')} onClick={() => onDelete(u.email)} className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/5">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {processedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search className="w-12 h-12" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No matching students found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
