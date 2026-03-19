"use client";

import React from 'react';
import Link from 'next/link';
import { Play, Clock, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface ListViewProps {
  tests: any[];
}

export function ListView({ tests }: ListViewProps) {
  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
            <TableHead className="font-black uppercase text-[10px] tracking-widest px-10 py-6">Assessment Module</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Classification</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Efficiency</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-right px-10 min-w-[200px]">Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test, i) => (
            <TableRow key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
              <TableCell className="px-10 py-6">
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg">{test.title}</span>
                  <span className="text-xs font-medium text-slate-400 line-clamp-1 max-w-md">{test.description}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {test.category || "General"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration || '15m'}</span>
                  <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {test.questions_count || '--'} items</span>
                </div>
              </TableCell>
              <TableCell className="text-right px-10">
                <div className="flex justify-end items-center">
                  <Link href={`/quiz?id=${test.id}`}>
                    <Button 
                      className="rounded-full h-11 px-6 bg-primary text-white font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20"
                    >
                      Start Assessment
                      <Play className="w-3 h-3 ml-2 fill-current" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
