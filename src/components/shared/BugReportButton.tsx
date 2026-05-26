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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bug, 
  Send, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  Info,
  Monitor,
  Clock,
  User,
  Layout
} from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { validateReportContent } from '@/lib/report-validator';
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('other');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const isBanned = isReportBanned();

  // DEBOUNCED VALIDATION PULSE
  useEffect(() => {
    if (!description) {
      setValidationError(null);
      return;
    }
    const handler = setTimeout(() => {
      const result = validateReportContent(description);
      setValidationError(result.valid ? null : result.reason || null);
    }, 500);
    return () => clearTimeout(handler);
  }, [description]);

  const autoContext = useMemo(() => {
    if (typeof window === 'undefined') return null;

    // 1. Identify Page Registry
    const path = window.location.pathname;
    let pageName = path;
    if (path === '/') pageName = 'Home';
    else if (path === '/tests') pageName = 'Test Library';
    else if (path === '/quiz') pageName = `Quiz: ${testId || 'Unknown'}`;
    else if (path === '/join') pageName = 'Live Session Join';
    else if (path.startsWith('/live/')) pageName = 'Live Session';
    else if (path.includes('/admin/tests/')) pageName = 'Test Editor';
    else if (path === '/profile') pageName = 'Profile';

    // 2. Extract Browser Node
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = `Chrome ${ua.split("Chrome/")[1].split(" ")[0].split(".")[0]}`;
    else if (ua.includes("Firefox")) browser = `Firefox ${ua.split("Firefox/")[1].split(".")[0]}`;
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = `Safari`;
    else if (ua.includes("Edg")) browser = `Edge`;

    // 3. Screen Classification
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

  const handleSubmit = async () => {
    if (!description.trim() || loading || validationError) return;

    setLoading(true);
    let res: Response | undefined;
    try {
      const contextAppendix = `
---AUTO CONTEXT---
Page: ${autoContext?.url} (${autoContext?.page})
Question: ${autoContext?.question || 'N/A'}
Mode: ${autoContext?.mode || 'N/A'}
Time: ${autoContext?.timestamp}
Browser: ${autoContext?.browser}
Recent Errors: ${autoContext?.errors?.join(' | ') || 'None'}
User: ${autoContext?.identity}
Extra: ${JSON.stringify(context || {})}
`;

      res = await fetch('/api/proxy/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: `${description.trim()}\n\n${contextAppendix}`,
          page_url: window.location.href,
          test_id: testId || 'N/A',
          browser: autoContext?.browser,
          device: autoContext?.browser.split(' on ')[1].split(' ')[0].toLowerCase(),
          user_name: user?.displayName || localStorage.getItem('dntrng_guest_name') || 'Anonymous Student',
          user_email: user?.email || 'Anonymous'
        })
      });

      if (res.ok) {
        toast({ title: "Report Submitted", description: "The registry has been updated." });
        setOpen(false);
        setDescription('');
        setCategory('other');
      } else {
        const errorData = await res.json();
        // OFFENSE TRACKING
        if (res.status === 400) {
          const record = recordReportOffense();
          if (record.status === 'warned') {
            toast({ 
              variant: "destructive", 
              title: "Validation Warning", 
              description: "Please keep reports respectful. Further violations will result in a ban." 
            });
          } else {
            toast({ 
              variant: "destructive", 
              title: "Access Suspended", 
              description: "Report access locked for 24 hours due to inappropriate content." 
            });
            setOpen(false);
          }
        }
        throw new Error(errorData.error || 'Submission Failed');
      }
    } catch (e: any) {
      if (res?.status !== 400) {
        toast({ variant: "destructive", title: "Gửi thất bại", description: e.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (isBanned) return null;

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-[90] h-10 w-10 rounded-full border-2 border-slate-100 bg-white/80 backdrop-blur-md text-slate-400 hover:text-primary hover:border-primary/20 shadow-lg group transition-all",
          className
        )}
        title="Report Issue / Báo Lỗi"
      >
        <Bug className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="p-10 pb-6 shrink-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Bug className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Report an Issue</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Báo Cáo Lỗi Hệ Thống</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Issue Type / Loại Lỗi</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="wrong_answer" className="font-bold">Wrong Answer / Đáp án sai</SelectItem>
                  <SelectItem value="question_broken" className="font-bold">Question Error / Câu hỏi lỗi</SelectItem>
                  <SelectItem value="score_wrong" className="font-bold">Score Issue / Điểm không đúng</SelectItem>
                  <SelectItem value="cant_join" className="font-bold">Join Issue / Không vào được</SelectItem>
                  <SelectItem value="image_broken" className="font-bold">Image Error / Hình ảnh lỗi</SelectItem>
                  <SelectItem value="other" className="font-bold">Other / Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Description / Mô tả</Label>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  description.length > 450 ? "text-rose-500" : "text-slate-300"
                )}>
                  {description.length} / 500
                </span>
              </div>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened... / Mô tả vấn đề bạn gặp phải..."
                className={cn(
                  "min-h-[120px] rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 p-4 font-medium transition-all",
                  validationError ? "ring-rose-200 bg-rose-50/30" : "focus:ring-primary/20"
                )}
              />
              {validationError && (
                <div className="flex items-start gap-2 text-rose-500 px-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">{validationError}</p>
                </div>
              )}
            </div>

            {/* ATTACHED CONTEXT NODES */}
            <div className="rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden">
               <button 
                 onClick={() => setShowContext(!showContext)}
                 className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
               >
                 <div className="flex items-center gap-3">
                   <Info className="w-4 h-4 text-slate-400" />
                   <div className="leading-tight">
                     <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Attached Context</span>
                     <span className="block text-[8px] font-bold uppercase text-slate-300">Thông tin đính kèm</span>
                   </div>
                 </div>
                 <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", showContext && "rotate-180")} />
               </button>
               
               {showContext && autoContext && (
                 <div className="p-5 pt-0 bg-slate-50/50 space-y-3 animate-in slide-in-from-top-2">
                    <ContextNode icon={Layout} label="Page" value={autoContext.page} />
                    <ContextNode icon={Monitor} label="Browser" value={autoContext.browser} />
                    <ContextNode icon={Clock} label="Time" value={autoContext.timestamp} />
                    {autoContext.question && <ContextNode icon={Bug} label="Question" value={autoContext.question} />}
                    <div className="h-px bg-slate-100 my-2" />
                    <p className="text-[8px] font-bold text-slate-400 uppercase text-center leading-relaxed">
                      This information helps us fix the issue faster.<br />
                      Thông tin này giúp chúng tôi xử lý nhanh hơn.
                    </p>
                 </div>
               )}
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 shrink-0">
            <Button 
              onClick={handleSubmit}
              disabled={loading || !description.trim() || !!validationError}
              className="w-full h-16 rounded-full bg-primary font-black uppercase tracking-widest shadow-xl shadow-primary/20 border-none transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Report / Gửi Báo Cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ContextNode({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{label}</p>
        <p className="text-[10px] font-bold text-slate-600 truncate">{value}</p>
      </div>
    </div>
  );
}
