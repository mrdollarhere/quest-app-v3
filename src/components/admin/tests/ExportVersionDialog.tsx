/**
 * @fileOverview Modular Format Selection Dialog for Assessments.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle, FileCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: 'pdf' | 'docx' | null;
  onSelect: (withAnswers: boolean) => void;
}

export function ExportVersionDialog({ open, onOpenChange, format, onSelect }: ExportVersionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-10 border-none shadow-2xl bg-white">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn("p-3 rounded-2xl", format === 'pdf' ? "bg-rose-50" : "bg-blue-50")}>
              <FileText className={cn("w-6 h-6", format === 'pdf' ? "text-rose-500" : "text-blue-500")} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                Export {format?.toUpperCase()}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Select document variant
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-8 space-y-4">
          <Button 
            onClick={() => onSelect(false)}
            className="w-full h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-primary/20 hover:bg-white transition-all text-slate-900 font-black flex items-center justify-between px-8 group shadow-sm hover:shadow-xl"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg uppercase tracking-tight">Questions Only</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Edition</span>
            </div>
            <HelpCircle className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors" />
          </Button>

          <Button 
            onClick={() => onSelect(true)}
            className="w-full h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-emerald-500/20 hover:bg-white transition-all text-slate-900 font-black flex items-center justify-between px-8 group shadow-sm hover:shadow-xl"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg uppercase tracking-tight">With Answer Key</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher Edition</span>
            </div>
            <FileCheck className="w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full h-12 rounded-full font-bold text-slate-400">Cancel / Hủy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
