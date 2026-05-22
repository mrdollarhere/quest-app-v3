"use client";

import React, { useState } from 'react';
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
import { Bug, Send, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BugReportButtonProps {
  testId?: string;
  className?: string;
}

export function BugReportButton({ testId, className }: BugReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('other');
  const [description, setDescription] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim() || loading) return;

    setLoading(true);
    try {
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      const device = screenWidth < 768 ? 'mobile' : screenWidth < 1200 ? 'tablet' : 'desktop';

      const payload = {
        category,
        description: description.trim(),
        page_url: window.location.href,
        test_id: testId || 'N/A',
        browser: navigator.userAgent,
        device,
        user_name: user?.displayName || localStorage.getItem('dntrng_guest_name') || 'Anonymous Student',
        user_email: user?.email || 'Anonymous'
      };

      const res = await fetch('/api/proxy/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: "Report Submitted / Đã gửi báo cáo", description: "The registry has been updated." });
        setOpen(false);
        setDescription('');
        setCategory('other');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Submission Failed');
      }
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Submission Failed / Gửi thất bại",
        description: e.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-4 right-4 z-[90] h-10 px-4 rounded-full border-2 border-slate-100 bg-white/80 backdrop-blur-md text-slate-400 hover:text-primary hover:border-primary/20 shadow-lg group transition-all",
          className
        )}
      >
        <Bug className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Report Issue / Báo Lỗi</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader>
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

          <div className="py-6 space-y-8">
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
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe what happened... / Mô tả vấn đề bạn gặp phải..."
                className="min-h-[120px] rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/20 p-4 font-medium"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
              <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                Page URL and device info will be captured forensicallly to assist in resolution.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !description.trim()}
              className="w-full h-16 rounded-full bg-primary font-black uppercase tracking-widest shadow-xl shadow-primary/20 border-none"
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
