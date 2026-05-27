"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, UserPlus, Mail, Lock, Eye, EyeOff, User, Loader2, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  onSave: (data: any) => void;
  onSaveBatch?: (data: any[]) => void;
  loading?: boolean;
}

export function UserDialog({ open, onOpenChange, editingItem, onSave, onSaveBatch, loading }: UserDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "ai">("single");
  const [showPassword, setShowPassword] = useState(false);
  const [showBatchPassword, setShowBatchPassword] = useState(false);
  
  // AI State Nodes
  const [aiText, setAiText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    if (open) {
      setAiResults([]);
      setAiText('');
      if (editingItem) {
        setFormData({
          name: editingItem.name || '',
          email: editingItem.email || '',
          password: editingItem.password || '',
          role: editingItem.role || 'user'
        });
      } else {
        setFormData({ name: '', email: '', password: '', role: 'user' });
      }
    }
  }, [open, editingItem]);

  const handleAiProcess = async () => {
    if (!aiText.trim() || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/ai/generate-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiText })
      });
      const data = await res.json();
      if (res.ok) {
        setAiResults(data.users || []);
        toast({ title: "Intelligence Extracted", description: `Found ${data.count} student identities.` });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiSave = () => {
    if (onSaveBatch && aiResults.length > 0) {
      onSaveBatch(aiResults);
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const batchFormData = new FormData(e.currentTarget);
    const data = Object.fromEntries(batchFormData.entries());
    const batch: any[] = [];
    const start = parseInt(String(data.rangeStart || "1"));
    const end = parseInt(String(data.rangeEnd || "10"));
    for (let i = start; i <= end; i++) {
      const numStr = i.toString().padStart(2, '0');
      batch.push({
        id: `batch_${Date.now()}_${i}`,
        name: String(data.namePrefix || "") + numStr,
        email: String(data.emailPattern || "").replace('{{n}}', numStr).replace('[n]', numStr),
        password: String(data.password || "admin123"),
        role: String(data.role || "user")
      });
    }
    if (onSaveBatch) onSaveBatch(batch);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[95vh] flex flex-col">
        {loading && <div className="absolute inset-0 z-[100] bg-white/10 backdrop-blur-[0.5px]" />}
        
        <DialogHeader className="p-10 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {editingItem ? 'Edit Identity' : 'Add Identity'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!editingItem && (
          <div className="px-10 shrink-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-12">
                <TabsTrigger value="single" className="rounded-xl font-black uppercase text-[9px] tracking-widest">Manual</TabsTrigger>
                <TabsTrigger value="batch" className="rounded-xl font-black uppercase text-[9px] tracking-widest">Sequence</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-1.5"><Sparkles className="w-3 h-3" /> AI Import</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Tabs value={editingItem ? "single" : activeTab} className="w-full">
            <TabsContent value="single">
              <form onSubmit={handleSingleSubmit} className="p-10 pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Full Name</Label>
                  <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={loading} required className="h-14 pl-11 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Email</Label>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading || !!editingItem} required className="h-14 pl-11 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Secret Key</Label>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} className="h-14 pl-11 pr-12 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 font-bold" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                </div>
                <Button type="submit" disabled={loading || !formData.name || !formData.email} className="w-full h-16 rounded-full bg-primary font-black uppercase shadow-xl">{loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Commit Identity</Button>
              </form>
            </TabsContent>

            <TabsContent value="batch">
              <form onSubmit={handleBatchSubmit} className="p-10 pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="font-black text-[10px] uppercase text-slate-400">Prefix</Label><Input name="namePrefix" placeholder="Student " className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100" /></div>
                  <div className="space-y-2"><Label className="font-black text-[10px] uppercase text-slate-400">Range</Label><div className="flex items-center gap-2"><Input name="rangeStart" type="number" defaultValue="1" className="h-12 text-center" /><span>-</span><Input name="rangeEnd" type="number" defaultValue="10" className="h-12 text-center" /></div></div>
                </div>
                <div className="space-y-2"><Label className="font-black text-[10px] uppercase text-slate-400">Pattern</Label><Input name="emailPattern" required placeholder="student{{n}}@dntrng.com" className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 font-mono" /></div>
                <Button type="submit" disabled={loading} className="w-full h-16 rounded-full bg-primary font-black uppercase shadow-xl">Initialize Sequence</Button>
              </form>
            </TabsContent>

            <TabsContent value="ai">
              <div className="p-10 pt-6 space-y-8">
                <div className="p-6 bg-violet-50 rounded-[2.5rem] border-2 border-dashed border-violet-200 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><Brain className="w-6 h-6 text-violet-600" /></div>
                  <div className="space-y-1"><p className="text-sm font-black uppercase text-violet-700">AI Identity Parsing</p><p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-relaxed">Paste a list of full names below. Gemini will extract identities and generate email nodes.</p></div>
                </div>

                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Raw Roster Data</Label>
                  <Textarea value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="e.g. 1. Nguyen Van An, 2. Tran Thi Binh..." className="min-h-[150px] rounded-[2rem] bg-slate-50 border-none ring-1 ring-slate-100 p-6 font-medium" />
                  <Button onClick={handleAiProcess} disabled={isAiProcessing || !aiText.trim()} className="w-full h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-black uppercase shadow-xl transition-all hover:scale-[1.02]">
                    {isAiProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Parse Identities
                  </Button>
                </div>

                {aiResults.length > 0 && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between px-2"><Label className="font-black text-[10px] uppercase text-slate-400">Preview Registry ({aiResults.length} Nodes)</Label></div>
                    <div className="bg-slate-50 rounded-[2rem] border overflow-hidden divide-y">
                      {aiResults.map((u, i) => (
                        <div key={i} className="p-4 flex items-center justify-between bg-white/50">
                          <div className="min-w-0"><p className="text-xs font-black uppercase text-slate-700 truncate">{u.name}</p><p className="text-[9px] font-mono text-slate-400 truncate">{u.email}</p></div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleAiSave} disabled={loading} className="w-full h-16 rounded-full bg-primary font-black uppercase shadow-2xl border-none shadow-primary/20">Commit AI Registry</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
