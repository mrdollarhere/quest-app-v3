"use client";

import React from 'react';
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
import { Save, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  onSave: (data: any) => void;
}

export function TestDialog({ open, onOpenChange, editingItem, onSave }: TestDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
        <div className="bg-primary p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Settings2 className="w-24 h-24" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight mb-2">
            {editingItem ? 'Edit Test' : 'Create Test'}
          </DialogTitle>
          <DialogDescription className="text-white/80 font-medium text-sm italic">
            Save the basic details for this assessment.
          </DialogDescription>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
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

          <DialogFooter className="pt-6">
            <Button type="submit" className="rounded-full w-full h-16 font-black text-xl shadow-2xl transition-all hover:scale-[1.02] bg-primary">
              <Save className="w-5 h-5 mr-3" /> Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
