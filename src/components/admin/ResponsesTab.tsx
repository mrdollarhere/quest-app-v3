"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ResponsesTabProps {
  responses: any[];
}

export function ResponsesTab({ responses }: ResponsesTabProps) {
  return (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500 bg-white">
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="font-black text-2xl text-slate-900">Global Results</CardTitle>
        <CardDescription>Comprehensive log of all test submissions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((r, i) => {
              const score = Number(r.Score);
              const total = Number(r.Total);
              const pct = (score / total) * 100;
              return (
                <TableRow key={i}>
                  <TableCell className="text-[10px] font-medium text-slate-500">{new Date(r.Timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-slate-900 truncate max-w-[150px]">{r['User Email'] || 'Guest'}</TableCell>
                  <TableCell className="font-black text-slate-700">{r['Test ID']}</TableCell>
                  <TableCell className="font-bold text-slate-700">{score} / {total}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-black px-3",
                      pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                    )}>
                      {pct >= 80 ? 'EXCELLENT' : pct >= 50 ? 'PASS' : 'FAIL'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {responses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                  No submissions recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
