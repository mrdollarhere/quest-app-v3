"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Bug, 
  Send, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  Info,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  UserX,
  Check,
  Clock
} from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isReportBanned, recordReportOffense } from '@/lib/spam-guard';
import { getRecentErrors } from '@/app/layout';

interface BugReportButtonProps {
  testId?: string;
  questionId?: string;
  questionIndex?: number;
  questionType?: string;
  quizMode?: string;
  context?: Record<string, unknown>;
  totalQuestions?: number;
  className?: string;
}

export function BugReportButton({ 
  testId, 
  questionId, 
  questionIndex, 
  questionType, 
  quizMode,
  context,
  totalQuestions,
  className 
}: BugReportButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // Stores ID of currently submitting action
  const [showContext, setShowContext] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submittedActions, setSubmittedActions] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // COOLDOWN PROTOCOL
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const autoContext = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const path = window.location.pathname;
    let pageName = path;
    if (path === '/') pageName = 'Home';
    else if (path === '/tests') pageName = 'Test Library';
    else if (path === '/quiz') pageName = `Quiz: ${testId || 'Unknown'}`;
    else if (path === '/join') pageName = 'Live Session Join';
    else if (path.startsWith('/live/')) pageName = 'Live Session';
    else if (path.includes('/admin/tests/')) pageName = 'Test Editor';
    else if (path === '/profile') pageName = 'Profile';

    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = `Chrome ${ua.split("Chrome/")[1].split(" ")[0].split(".")[0]}`;
    else if (ua.includes("Firefox")) browser = `Firefox ${ua.split("Firefox/")[1].split(".")[0]}`;
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = `Safari`;
    else if (ua.includes("Edg")) browser = `Edge`;

    const width = window.innerWidth;
    const device = width < 768 ? 'Mobile' : width < 1200 ? 'Tablet' : 'Desktop';

    return {
      page: pageName,
      url: window.location.href,
      browser: `${browser} on ${device} (${width}x${window.innerHeight})`,
      timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + " GMT+7",
      errors: getRecentErrors(),
      question: questionId ? `Q${(questionIndex || 0) + 1}${totalQuestions ? `/${totalQuestions}` : ''} | ID: ${questionId} | Type: ${questionType}` : null,
      mode: quizMode || null,
      identity: user ? `${user.displayName} | ${user.email} | ${user.role}` : localStorage.getItem('dntrng_guest_name') || 'Anonymous Student'
    };
  }, [testId, questionId, questionIndex, totalQuestions, questionType, quizMode, user, open]);

  const handleSubmit = async (actionId: string, actionLabel: string) => {
    if (loading || cooldown > 0 || submittedActions.has(actionId)) return;

    setLoading(actionId);
    try {
      const timestamp = new Date().toLocaleString();
      const reportDesc = `AUTOMATED SNAPSHOT: ${actionLabel.toUpperCase()} at ${timestamp}`;
      
      const contextAppendix = `
---AUTO CONTEXT---
Action: ${actionLabel}
Page: ${autoContext?.url} (${autoContext?.page})
Question: ${autoContext?.question || 'N/A'}
Mode: ${autoContext?.mode || 'N/A'}
Time: ${autoContext?.timestamp}
Browser: ${autoContext?.browser}
Recent Errors: ${autoContext?.errors?.join(' | ') || 'None'}
User: ${autoContext?.identity}
Extra: ${JSON.stringify(context || {})}
`;

      const res = await fetch('/api/proxy/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: actionId,
          description: `${reportDesc}\n\n${contextAppendix}`,
          page_url: window.location.href,
          test_id: testId || 'N/A',
          browser: autoContext?.browser,
          device: autoContext?.browser?.split(' on ')[1]?.split(' ')[0]?.toLowerCase() || 'unknown',
          user_name: user?.displayName || localStorage.getItem('dntrng_guest_name') || 'Anonymous Student',
          user_email: user?.email || 'Anonymous'
        })
      });

      if (res.ok) {
        toast({ title: "Snapshot Transmitted", description: "The intelligence registry has been updated." });
        setSubmittedActions(prev => new Set(prev).add(actionId));
        setCooldown(30); // 30s Cooldown to prevent spam
        
        // Auto-close after a short delay
        setTimeout(() => setOpen(false), 1500);
      } else {
        const errorData = await res.json();
        if (res.status === 400) {
          const record = recordReportOffense();
          toast({ variant: "destructive", title: "Rate Limit Exceeded", description: "Too many requests. Please wait." });
        }
        throw new Error(errorData.error || 'Submission Failed');
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: e.message });
    } finally {
      setLoading(null);
    }
  };

  if (mounted && isReportBanned() && user?.role !== 'admin') return null;
  if (!mounted) return null;

  const quickActions = [
    { id: 'wrong_answer', label: 'Wrong Answer', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'image_broken', label: 'Image Broken', icon: ImageIcon, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'score_wrong', label: 'Score Error', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'cant_join', label: 'Access Issue', icon: UserX, color: 'bg-rose-50 text-rose-600 border-rose-100' }
  ];

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-[95] h-10 w-10 rounded-full border-2 border-slate-100 bg-white/80 backdrop-blur-md text-slate-400 hover:text-primary hover:border-primary/20 shadow-lg group transition-all",
          className
        )}
      >
        <Bug className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="p-10 pb-6 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl shadow-sm"><Bug className="w-6 h-6 text-primary" /></div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Intelligence Audit</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an issue to transmit snapshot</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar pt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">One-Tap Diagnostic / Gửi nhanh</Label>
                {cooldown > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600 animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-black tabular-nums">{cooldown}s</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action) => {
                  const isSubmitting = loading === action.id;
                  const isDone = submittedActions.has(action.id);
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSubmit(action.id, action.label)}
                      disabled={!!loading || cooldown > 0 || isDone}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all text-left group flex items-center justify-between",
                        action.color,
                        (loading || cooldown > 0) && !isSubmitting && !isDone && "opacity-40 grayscale",
                        isDone ? "bg-emerald-500 border-emerald-500 text-white" : "hover:scale-[1.02] active:scale-95 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <action.icon className={cn("w-6 h-6", isDone ? "text-white" : "")} />
                        <span className="text-xs font-black uppercase tracking-tight">{action.label}</span>
                      </div>
                      
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isDone ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : (
                        <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden">
               <button onClick={() => setShowContext(!showContext)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                   <Info className="w-4 h-4 text-slate-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">View Diagnostic Data</span>
                 </div>
                 <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", showContext && "rotate-180")} />
               </button>
               {showContext && autoContext && (
                 <div className="p-5 pt-0 space-y-2 animate-in slide-in-from-top-2">
                    <ContextRow label="Page" value={autoContext.page} />
                    <ContextRow label="Context" value={autoContext.question || 'Standard Navigation'} />
                    <ContextRow label="Node ID" value={autoContext.identity} />
                    <div className="pt-2">
                      <p className="text-[8px] font-black uppercase text-slate-300 mb-1">Status</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Ready to transmit
                      </p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
               <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
               <p className="text-[10px] font-medium text-blue-600 leading-relaxed">
                 Manual descriptions are disabled. The system automatically captures all relevant context for forensic audit.
                 <br />
                 <span className="opacity-70">Mô tả thủ công đã bị tắt. Hệ thống tự động ghi lại toàn bộ ngữ cảnh kỹ thuật.</span>
               </p>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 shrink-0">
             <Button variant="ghost" onClick={() => setOpen(false)} className="w-full h-12 rounded-full font-black uppercase text-[10px] tracking-widest text-slate-400">Close / Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ContextRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[8px] font-black uppercase text-slate-400 min-w-[50px]">{label}:</span>
      <span className="text-[9px] font-bold text-slate-500 truncate">{value}</span>
    </div>
  );
}
