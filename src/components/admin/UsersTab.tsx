
"use client";

import React, { useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface UsersTabProps {
  users: any[];
  responses: any[];
  onEdit: (user: any) => void;
  onDelete: (email: string) => void;
  onAdd: () => void;
}

export function UsersTab({ users, responses, onEdit, onDelete, onAdd }: UsersTabProps) {
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

  return (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500 bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-50/50 border-b">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-black text-2xl text-slate-900 uppercase tracking-tight">Access Registry</CardTitle>
            <CardDescription className="font-medium">Platform identity management and operator oversight</CardDescription>
          </div>
        </div>
        <Button onClick={onAdd} className="rounded-full gap-2 font-black h-12 px-6 shadow-xl bg-primary">
          <Plus className="w-4 h-4" /> New Identity
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
              <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">Identity Profile</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Access Level</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Sessions</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Accuracy</TableHead>
              <TableHead className="px-8 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, i) => {
              const email = String(u.email || '').toLowerCase();
              const s = userStats[email] || { count: 0, passed: 0, avg: 0 };
              
              return (
                <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-primary text-xs shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-none mb-1">{u.name}</span>
                        <span className="text-xs font-medium text-slate-400">{u.email}</span>
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
                      <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Logs</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "font-black",
                        s.avg >= 80 ? "text-green-600" : s.avg >= 50 ? "text-orange-600" : "text-slate-400"
                      )}>
                        {s.count > 0 ? `${s.avg}%` : '--'}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Mean</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link href={`/admin/users/${encodeURIComponent(u.email)}`}>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-primary/5 text-primary">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(u)} className="rounded-full h-10 w-10 hover:bg-slate-100">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(u.email)} className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <User className="w-12 h-12" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">No Identities Registered</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
