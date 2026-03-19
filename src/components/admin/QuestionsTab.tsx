
"use client";

import React from 'react';
import { 
  Plus, 
  HelpCircle, 
  FileText, 
  Edit, 
  Trash2 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Question } from '@/types/quiz';

interface QuestionsTabProps {
  questions: Question[];
  tests: any[];
  selectedTestId: string;
  setSelectedTestId: (id: string) => void;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onBulkEdit: () => void;
}

export function QuestionsTab({ 
  questions, 
  tests, 
  selectedTestId, 
  setSelectedTestId, 
  onEdit, 
  onDelete, 
  onAdd, 
  onBulkEdit 
}: QuestionsTabProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="font-black text-2xl text-slate-900">Question Bank</CardTitle>
              <CardDescription>Content management for selected assessments</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Select value={selectedTestId} onValueChange={setSelectedTestId}>
              <SelectTrigger className="w-[220px] rounded-full font-bold border-2">
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {tests.map(t => (
                  <SelectItem key={t.id} value={t.id} className="font-bold">{t.title || t.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onBulkEdit} className="rounded-full font-bold border-2">
              <FileText className="w-4 h-4 mr-2" /> Bulk Edit
            </Button>
            <Button onClick={onAdd} className="rounded-full font-bold shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Question Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q, i) => (
                <TableRow key={i} className="group">
                  <TableCell className="text-xs font-mono text-slate-400">{q.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize font-bold">
                      {q.question_type?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate font-bold text-slate-700">{q.question_text}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(q)} className="rounded-full">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(q.id)} className="rounded-full text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground bg-slate-50/20">
                    <div className="flex flex-col items-center gap-2">
                      <HelpCircle className="w-10 h-10 opacity-20" />
                      <p className="font-bold">No questions found for this test.</p>
                      <Button variant="link" onClick={onAdd}>Create the first question</Button>
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
