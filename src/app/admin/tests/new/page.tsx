
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Trophy, X, Sparkles } from "lucide-react";
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';
import { TestDetailsForm } from '@/components/admin/tests/TestDetailsForm';
import { Card } from '@/components/ui/card';

export default function NewTestPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [certEnabled, setCertEnabled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    data.difficulty = difficulty;
    data.certificate_enabled = certEnabled ? "TRUE" : "FALSE";
    if (!data.passing_threshold) data.passing_threshold = String(settings.default_pass_threshold || "70");
    if (data.duration && !String(data.duration).includes('m')) data.duration = `${data.duration}m`;

    if (!data.id) {
      const slug = (data.title as string || 'test').toLowerCase().replace(/[^a-z0-9]/g, '-');
      data.id = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    try {
      const res = await fetch('/api/proxy/admin/save-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
      if (!res.ok) throw new Error();
      toast({ title: "Test Created" });
      trackEvent('admin_test_create', { test_id: data.id as string, test_name: data.title as string });
      router.push(`/admin/tests/${data.id}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <Button variant="ghost" onClick={() => router.back()} className="rounded-full font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleCreate} className="flex-1 space-y-8">
          <div><h1 className="text-4xl font-black uppercase tracking-tight">New Test</h1><p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Registry Allocation Protocol</p></div>

          <TestDetailsForm difficulty={difficulty} setDifficulty={setDifficulty} imageUrl={imageUrl} setImageUrl={setImageUrl} />

          <div className="p-8 bg-slate-900 text-white rounded-none space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-primary" /><div className="space-y-0.5"><p className="font-black uppercase tracking-tight">Certification Protocol</p><p className="text-[10px] text-slate-400">Issue credentials upon mastery</p></div></div>
              <Switch checked={certEnabled} onCheckedChange={setCertEnabled} />
            </div>
            {certEnabled && (
              <div className="space-y-2 animate-in slide-in-from-top-2"><Label className="text-[10px] font-black uppercase text-slate-400">Passing Threshold (%)</Label><Input name="passing_threshold" type="number" defaultValue={settings.default_pass_threshold || 70} className="rounded-none h-14 bg-white/5 border-none ring-1 ring-white/10 font-black text-primary text-xl" /></div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-none bg-primary font-black text-2xl uppercase tracking-tighter shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01]">{loading ? <Loader2 className="w-8 h-8 animate-spin mr-3" /> : <Save className="w-8 h-8 mr-3" />} Save & Add Questions</Button>
        </form>

        {showSidebar && (
          <div className="hidden lg:block w-80 shrink-0"><div className="sticky top-28 space-y-6"><Card className="border-none shadow-xl rounded-none bg-slate-900 text-white p-8 relative overflow-hidden group"><Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-4 h-4" /></Button><Sparkles className="w-8 h-8 text-primary mb-6 animate-pulse" /><h3 className="text-xl font-black uppercase mb-4">Pro Tip</h3><p className="text-sm text-slate-400 font-medium leading-relaxed">Certification threshold calibration ensures only high-precision operators are issued credentials.</p></Card></div></div>
        )}
      </div>
    </div>
  );
}
