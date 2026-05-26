"use client";

import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface AntiCheatModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  violationCount: number;
  isFlagged: boolean;
}

export function AntiCheatModal({ isOpen, onAcknowledge, violationCount, isFlagged }: AntiCheatModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md animate-in zoom-in-95 duration-300">
        <div className={cn(
          "p-10 text-center space-y-6",
          isFlagged ? "bg-rose-50" : "bg-amber-50"
        )}>
          <div className={cn(
            "mx-auto w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl",
            isFlagged ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
          )}>
            {isFlagged ? <ShieldAlert className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
          
          <div className="space-y-2">
            <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {isFlagged ? "Registry Flagged" : "Warning / Cảnh Báo"}
            </AlertDialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Integrity Protocol Violation
            </p>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600 leading-relaxed text-center">
              {isFlagged 
                ? "Multiple tab switches detected. Your assessment has been flagged for administrative review."
                : "Tab switching or window blurring detected. Please remain focused on the assessment terminal."
              }
            </p>
            <p className="text-xs font-bold text-slate-400 italic text-center leading-relaxed">
              {isFlagged
                ? "Phát hiện nhiều lần chuyển tab. Bài làm của bạn đã bị ghi nhận để xem xét."
                : "Phát hiện chuyển tab hoặc ứng dụng. Vui lòng tập trung vào màn hình làm bài."
              }
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Violation Instance</span>
            </div>
            <span className={cn(
              "text-lg font-black",
              isFlagged ? "text-rose-600" : "text-amber-600"
            )}>
              {violationCount} / 3
            </span>
          </div>
        </div>

        <AlertDialogFooter className="p-10 pt-0">
          <AlertDialogAction asChild>
            <Button 
              onClick={onAcknowledge}
              className={cn(
                "w-full h-16 rounded-full font-black uppercase tracking-widest text-xs shadow-xl border-none",
                isFlagged ? "bg-rose-600 shadow-rose-500/20" : "bg-slate-900 shadow-slate-900/20"
              )}
            >
              I Understand / Tôi Hiểu
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
