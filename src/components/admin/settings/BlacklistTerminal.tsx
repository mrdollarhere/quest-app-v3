/**
 * BlacklistTerminal.tsx
 * 
 * Purpose: Manages forbidden terms for callsign validation.
 * Extracted v19.6 (Phase 2 Refactor).
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Ban, Plus, X, Trash2 } from 'lucide-react';
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

interface BlacklistTerminalProps {
  blacklistJson: string;
  onUpdate: (json: string) => void;
}

export function BlacklistTerminal({ blacklistJson, onUpdate }: BlacklistTerminalProps) {
  const { toast } = useToast();
  const [bulkInput, setBulkInput] = useState('');
  
  const blacklist = JSON.parse(blacklistJson || '[]');

  const updateList = (newList: string[]) => {
    onUpdate(JSON.stringify(newList));
  };

  const addWord = (word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return;
    if (blacklist.some((n: string) => n.toLowerCase() === trimmed)) {
      toast({ title: "Duplicate Term" });
      return;
    }
    updateList([...blacklist, trimmed]);
  };

  const handleBulkImport = () => {
    const words = bulkInput.split('\n').map(n => n.trim().toLowerCase()).filter(n => n.length > 0);
    const combined = Array.from(new Set([...blacklist, ...words]));
    updateList(combined);
    setBulkInput('');
    toast({ title: "Blocklist Updated" });
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
        <h2 className="text-xl font-black flex items-center gap-3">
          <Ban className="w-5 h-5 text-rose-500" /> Custom Name Blacklist
        </h2>
        <CardDescription>Block specific words or names from being used as callsigns</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-400">Block Term</Label>
            <div className="flex gap-2">
              <Input 
                id="new-black"
                placeholder="Word to block..."
                className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold"
                onKeyDown={(e) => { if (e.key === 'Enter') { addWord(e.currentTarget.value); e.currentTarget.value = ''; } }}
              />
              <Button variant="secondary" className="h-12 w-12 rounded-xl" onClick={() => { const i = document.getElementById('new-black') as HTMLInputElement; addWord(i.value); i.value = ''; }}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-400">Bulk Block</Label>
            <Textarea placeholder="Words per line..." value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 py-3" />
            <Button variant="outline" onClick={handleBulkImport} className="w-full h-11 rounded-xl font-black uppercase text-[10px] border-2">Import Blocklist</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase text-slate-400">Blocked Terms ({blacklist.length})</Label>
            {blacklist.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-rose-500 font-black uppercase text-[9px]">
                    <Trash2 className="w-3 h-3 mr-2" /> Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem]">
                  <AlertDialogHeader><AlertDialogTitle>Clear Blacklist?</AlertDialogTitle><AlertDialogDescription>This will remove all block restrictions.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => updateList([])} className="bg-rose-500">Purge</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-6 bg-slate-50/50 rounded-[2rem] border min-h-[120px]">
            {blacklist.map((word: string) => (
              <Badge key={word} variant="secondary" className="pl-3 pr-1 py-1 gap-1 bg-white border border-rose-100 text-rose-600 text-xs font-bold rounded-none">
                {word}
                <button onClick={() => updateList(blacklist.filter((w: string) => w !== word))}><X className="w-3.5 h-3.5 hover:text-rose-500" /></button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
