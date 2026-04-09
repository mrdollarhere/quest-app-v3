"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  HelpCircle, 
  FileText, 
  Edit, 
  Trash2,
  Search,
  Filter,
  XCircle,
  Database,
  RefreshCcw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { Question, QuestionType } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/language-context';

interface QuestionsTabProps {
  questions: Question[];
  tests: any[];
  selectedTestId: string;
  setSelectedTestId: (id: string) => void;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onBulkEdit: () => void;
  loading?: boolean;
}

const QUESTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'multiple_true_false', label: 'Multiple T/F' },
  { value: 'matrix_choice', label: 'Matrix Choice' },
  { value: 'short_text', label: 'Short Text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'ordering', label: 'Ordering' },
  { value: 'matching', label: 'Matching' },
  { value: 'hotspot', label: 'Hotspot' },
  { value: 'rating', label: 'Rating' },
];

export function QuestionsTab({ 
  questions, 
  tests, 
  selectedTestId, 
  setSelectedTestId, 
  onEdit, 
  onDelete, 
  onAdd, 
  onBulkEdit,
  loading
}: QuestionsTabProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const qText = String(q.question_text || "");
      const matchesSearch = qText.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || q.question_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [questions, searchTerm, typeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 bg-slate-50/50 p-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 rotate-3">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="font-black text-3xl text-slate-900 uppercase tracking-tight">Question Registry</CardTitle>
              <CardDescription className="font-medium text-slate-500">Manage intelligence nodes for this module</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={loading}>
              <SelectTrigger className="w-[240px] h-12 rounded-xl font-bold border-none ring-1 ring-slate-200 bg-white">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {tests.map(t => (
                  <SelectItem key={t.id} value={t.id} className="font-bold">{t.title || t.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onBulkEdit} disabled={loading} className="rounded-xl h-12 font-bold border-none ring-1 ring-slate-200 bg-white hover:bg-slate-50">
              <FileText className="w-4 h-4 mr-2" /> JSON Editor
            </Button>
            <Button onClick={onAdd} disabled={loading} className="rounded-xl h-12 px-6 font-black shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="px-10 py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search questions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  className="pl-11 h-11 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-medium"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={loading}>
                <SelectTrigger className="w-full md:w-[200px] h-11 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    <SelectValue placeholder="Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="font-bold text-xs uppercase tracking-widest">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || typeFilter !== "all") && (
                <Button variant="ghost" onClick={clearFilters} disabled={loading} className="h-11 rounded-xl px-4 font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-primary">
                  <XCircle className="w-4 h-4 mr-2" /> Clear
                </Button>
              )}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
              Showing <span className="text-primary">{filteredQuestions.length}</span> of <span className="text-slate-900">{questions.length}</span> Nodes
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none">
                <TableHead className="px-10 py-5 font-black uppercase text-[10px] tracking-widest text-slate-400">Step</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Classification</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Question Content</TableHead>
                <TableHead className="px-10 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((q, i) => (
                <TableRow key={q.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                  <TableCell className="px-10 py-6">
                    <span className="text-xs font-black text-slate-300">#{(i + 1).toString().padStart(2, '0')}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full bg-primary/5 text-primary border-none">
                      {String(q.question_type || '').replace('_', ' ') || 'Choice'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-bold text-slate-700 truncate text-sm" title={String(q.question_text)}>
                      {q.question_text}
                    </p>
                    <p className="text-[9px] font-mono text-slate-300 mt-1 uppercase tracking-tighter">ID: {q.id}</p>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <div className="flex justify-end gap-2 transition-all">
                      <Button variant="ghost" size="icon" disabled={loading} onClick={() => onEdit(q)} className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={loading} onClick={() => setDeleteConfirmId(q.id)} className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredQuestions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-32 bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Search className="w-12 h-12" />
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No Intelligence Matches</p>
                        <p className="text-[10px] font-bold">Try adjusting your search query or type filter</p>
                      </div>
                      <Button variant="link" onClick={clearFilters} disabled={loading} className="font-black text-primary uppercase tracking-widest text-[9px]">Reset Registry View</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && !loading && setDeleteConfirmId(null)}>
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
