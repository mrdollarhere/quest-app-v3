
"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

interface TestsTabProps {
  tests: any[];
  onEdit: (test: any) => void;
  onDelete: (id: string) => void;
  onManageQuestions: (id: string) => void;
  onAdd: () => void;
}

export function TestsTab({ tests, onEdit, onDelete, onManageQuestions, onAdd }: TestsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = tests.filter(t => 
    (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-none shadow-sm animate-in slide-in-from-bottom-4 duration-500 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-black text-2xl text-slate-900">Assessments</CardTitle>
          <CardDescription>Manage your master test registry</CardDescription>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter tests..." 
              className="pl-10 rounded-full bg-slate-50" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button onClick={onAdd} className="rounded-full gap-2 font-bold shadow-lg">
            <Plus className="w-4 h-4" /> New Test
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t, i) => (
              <TableRow key={i} className="group">
                <TableCell><Badge variant="outline" className="font-mono">{t.id}</Badge></TableCell>
                <TableCell className="font-black text-slate-700">{t.title}</TableCell>
                <TableCell><Badge variant="secondary" className="font-bold">{t.category}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onManageQuestions(t.id)} className="rounded-full text-primary font-bold">
                      <FileText className="w-4 h-4 mr-1" /> Questions
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="rounded-full">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} className="rounded-full text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
