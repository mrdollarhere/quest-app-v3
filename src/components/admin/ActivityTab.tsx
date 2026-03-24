
"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  History, 
  Search, 
  LogIn, 
  LogOut, 
  Clock, 
  User,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';

interface ActivityTabProps {
  activities: any[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return activities.filter(a => 
      String(a['User Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a['User Email'] || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t('systemActivity')}</h2>
          <p className="text-slate-500 font-medium">{t('monitorAccess')}</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search operator..." 
            className="h-12 pl-12 rounded-full bg-white border-none ring-1 ring-slate-100 focus:ring-primary/40 text-sm font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">{t('timestamp')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">{t('student')}</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">{t('event')}</TableHead>
                <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a, i) => {
                const isLogin = String(a.Event).toLowerCase() === 'login';
                
                return (
                  <TableRow key={i} className="hover:bg-slate-50/50 group border-b border-slate-50 last:border-none">
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
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-primary text-xs shrink-0">
                          {String(a['User Name'] || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 leading-none mb-1 truncate">{a['User Name']}</span>
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
                    <TableCell className="px-8 text-right">
                      <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 text-[9px] font-black uppercase px-3">
                        Verified
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-32 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History className="w-12 h-12" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">No activity logs detected</p>
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
