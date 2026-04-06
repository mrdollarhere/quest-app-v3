
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Settings2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  onSave: (data: any) => void;
}

export function TestDialog({ open, onOpenChange, editingItem, onSave }: TestDialogProps) {
  const [certEnabled, setCertEnabled] = useState(false);

  useEffect(() => {
    if (open && editingItem) {
      setCertEnabled(String(editingItem.certificate_enabled) === "TRUE" || editingItem.certificate_enabled === true);
    } else if (open) {
      setCertEnabled(false);
    }
  }, [open, editingItem]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Explicitly add controlled values
    data.certificate_enabled = certEnabled ? "TRUE" : "FALSE";
    
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
        <div className="bg-primary p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Settings2 className="w-24 h-24" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight mb-2">
            {editingItem ? 'Edit Test' : 'Create Test'}
          </DialogTitle>
          <DialogDescription className="text-white/80 font-medium text-sm italic">
            Configure metadata and certification protocols.
          </DialogDescription>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">ID</Label>
              <Input 
                name="id" 
                defaultValue={editingItem?.id} 
                placeholder="auto-id" 
                readOnly={!!editingItem} 
                className={cn(
                  "rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs",
                  !!editingItem && "opacity-60 cursor-not-allowed select-none"
                )} 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Category</Label>
              <Input name="category" defaultValue={editingItem?.category} placeholder="e.g. Science" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Title</Label>
            <Input name="title" defaultValue={editingItem?.title} required placeholder="Name of the test" className="rounded-xl h-14 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-lg" />
          </div>

          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Description</Label>
            <Textarea name="description" defaultValue={editingItem?.description} placeholder="What is this test about?" className="rounded-2xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Difficulty</Label>
              <Input name="difficulty" defaultValue={editingItem?.difficulty} placeholder="Easy / Hard" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Time Limit</Label>
              <Input name="duration" defaultValue={editingItem?.duration} placeholder="e.g. 15m" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" />
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Certification</p>
                  <p className="text-[10px] text-slate-500 font-medium">Award certificate on completion</p>
                </div>
              </div>
              <Switch checked={certEnabled} onCheckedChange={setCertEnabled} />
            </div>

            {certEnabled && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Passing Threshold (%)</Label>
                <Input 
                  name="passing_threshold" 
                  type="number" 
                  defaultValue={editingItem?.passing_threshold || 70} 
                  className="rounded-xl h-12 bg-white dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black" 
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-6">
            <Button type="submit" className="rounded-full w-full h-16 font-black text-xl shadow-2xl transition-all hover:scale-[1.02] bg-primary">
              <Save className="w-5 h-5 mr-3" /> Save Module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
