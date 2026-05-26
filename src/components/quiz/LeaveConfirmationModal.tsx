"use client";

import React from 'react';
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
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveConfirmationModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function LeaveConfirmationModal({ isOpen, onStay, onLeave }: LeaveConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center space-y-6 bg-slate-900 text-white">
          <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center bg-primary shadow-xl">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight leading-none">
              Leave Quiz?
            </AlertDialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Thoát Bài Thi?
            </p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">Your progress will be lost.</p>
              <p className="text-sm font-medium text-slate-500 italic">Tiến trình của bạn sẽ bị mất.</p>
            </div>
            <div className="h-px w-12 bg-slate-100 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-700">Are you sure you want to leave?</p>
              <p className="text-sm font-medium text-slate-400">Bạn có chắc muốn thoát không?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AlertDialogCancel asChild>
              <Button 
                onClick={onStay}
                className="h-14 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs border-none"
              >
                Stay / Ở lại
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={onLeave}
                className="h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 border-none"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave / Thoát
              </Button>
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
