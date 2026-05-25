/**
 * AccessControlTerminal.tsx
 * 
 * Purpose: Manages live classroom entry mode and student roster.
 * Extracted v19.6 (Phase 2 Refactor).
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Lock, Plus, X, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccessControlTerminalProps {
  joinMode: string;
  whitelistJson: string;
  onUpdateMode: (mode: string) => void;
  onUpdateWhitelist: (json: string) => void;
}

export function AccessControlTerminal({ joinMode, whitelistJson, onUpdateMode, onUpdateWhitelist }: AccessControlTerminalProps) {
  const { toast } = useToast();
  const [bulkInput, setBulkInput] = useState('');
  
  const whitelist = JSON.parse(whitelistJson || '[]');

  const updateList = (newList: string[]) => {
    onUpdateWhitelist(JSON.stringify(newList));
  };

  const addName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (whitelist.some((n: string) => n.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Duplicate Entry" });
      return;
    }
    updateList([...whitelist, trimmed]);
  };

  const handleBulkImport = () => {
    const names = bulkInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const combined = Array.from(new Set([...whitelist, ...names]));
    updateList(combined);
    setBulkInput('');
    toast({ title: "Import Successful", description: `${combined.length - whitelist.length} nodes added.` });
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-primary" /> Live Access Control
            </h2>
            <CardDescription>Control who can join your live classroom sessions</CardDescription>
          </div>
          <Switch 
            checked={joinMode === 'whitelist'}
            onCheckedChange={(val) => onUpdateMode(val ? 'whitelist' : 'open')}
          />
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {joinMode === 'whitelist' ? (
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400">Add Student</Label>
                <div className="flex gap-2">
                  <Input 
                    id="new-name"
                    placeholder="Full name..."
                    className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold"
                    onKeyDown={(e) => { if (e.key === 'Enter') { addName(e.currentTarget.value); e.currentTarget.value = ''; } }}
                  />
                  <Button variant="secondary" className="h-12 w-12 rounded-xl" onClick={() => { const i = document.getElementById('new-name') as HTMLInputElement; addName(i.value); i.value = ''; }}>
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400">Bulk Import</Label>
                <Textarea placeholder="Paste names..." value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 py-3" />
                <Button variant="outline" onClick={handleBulkImport} className="w-full h-11 rounded-xl font-black uppercase text-[10px] border-2">Import Roster</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-slate-400">Approved Students ({whitelist.length})</Label>
                {whitelist.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-rose-500 font-black uppercase text-[9px]">
                        <Trash2 className="w-3 h-3 mr-2" /> Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem]">
                      <AlertDialogHeader><AlertDialogTitle>Purge Roster?</AlertDialogTitle><AlertDialogDescription>This will delete all {whitelist.length} approved identities.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => updateList([])} className="bg-rose-500">Purge</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex flex-wrap gap-2 p-6 bg-slate-50/50 rounded-[2rem] border min-h-[120px]">
                {whitelist.map((name: string) => (
                  <Badge key={name} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-white border shadow-sm text-xs font-bold rounded-none">
                    {name}
                    <button onClick={() => updateList(whitelist.filter((n: string) => n !== name))}><X className="w-3.5 h-3.5 hover:text-rose-500" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center opacity-40">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-[11px] font-black uppercase text-slate-400 mt-4">Open Access Mode — No Roster Restrictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
