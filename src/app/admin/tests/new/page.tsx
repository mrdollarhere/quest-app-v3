"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Sparkles, LayoutGrid, Image as ImageIcon, Clock, Gauge, X, Trophy } from "lucide-react";
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';

export default function NewTestPage() {
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [certEnabled, setCertEnabled] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!API_URL) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Explicit Cast: Convert boolean state to registry-compatible string
    data.difficulty = difficulty;
    data.certificate_enabled = certEnabled ? "TRUE" : "FALSE";
    
    // Protocol: Ensure passing_threshold is always present in the payload
    if (!data.passing_threshold) {
      data.passing_threshold = String(settings.default_pass_threshold || "70");
    }
    
    // Auto-formatting duration suffix if only number provided
    if (data.duration && !String(data.duration).includes('m')) {
      data.duration = `${data.duration}m`;
    }

    if (!data.id) {
      const slug = (data.title as string || 'test').toLowerCase().replace(/[^a-z0-9]/g, '-');
      data.id = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'saveTest', data })
      });
      
      toast({ 
        title: "Test Created", 
        description: "Redirecting to question editor..." 
      });

      // Track successful creation
      trackEvent('admin_test_create', { 
        test_id: data.id as string, 
        test_name: data.title as string,
        details: {
          difficulty: data.difficulty,
          duration: data.duration,
          category: data.category,
          certificate_enabled: data.certificate_enabled
        }
      });
      
      router.push(`/admin/tests/${data.id}`);
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Could not create the test." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">New Test</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-3">Fill in the details below to create a new test</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Test Details
                </CardTitle>
                <CardDescription className="dark:text-slate-400">Primary information about this test.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Test ID (Optional)</Label>
                    <Input name="id" placeholder="leave blank for auto-id" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Category</Label>
                    <Input name="category" placeholder="Math, English, etc." className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">
                    Test Title <span className="text-destructive font-black">*</span>
                  </Label>
                  <Input name="title" required placeholder="Name of your test" className="h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-black text-lg" />
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                  <Textarea name="description" placeholder="A brief summary of this test..." className="min-h-[120px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-medium p-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Gauge className="w-3 h-3" /> Difficulty <span className="text-destructive font-black">*</span>
                    </Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="Easy" className="font-bold">Easy</SelectItem>
                        <SelectItem value="Medium" className="font-bold">Medium</SelectItem>
                        <SelectItem value="Hard" className="font-bold">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Time Limit <span className="text-destructive font-black">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input 
                        name="duration" 
                        type="number" 
                        required 
                        placeholder="e.g. 15" 
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-bold flex-1" 
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700">min</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-primary" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Certification Protocol</p>
                        <p className="text-[10px] text-slate-500 font-medium">Generate completion certificate for passing students</p>
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
                        defaultValue={settings.default_pass_threshold || 70} 
                        className="rounded-xl h-12 bg-white dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black" 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Cover Image URL
                    </Label>
                    <Input 
                      name="image_url" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..." 
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 font-mono text-xs" 
                    />
                  </div>
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 aspect-[16/6] bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative group">
                      <img 
                        src={imageUrl} 
                        alt="Thumbnail Preview" 
                        className="w-full h-full object-cover transition-opacity duration-500" 
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Live Preview</div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t dark:border-slate-800">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 rounded-full bg-primary font-black text-xl shadow-2xl transition-all hover:scale-[1.01] hover:shadow-primary/20"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    ) : (
                      <Save className="w-6 h-6 mr-3" />
                    )}
                    Save and Add Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {showSidebar && (
          <div className="hidden lg:block w-80 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="sticky top-28 space-y-6">
              <Card className="border-none shadow-xl rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSidebar(false)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Sparkles className="w-8 h-8 text-primary mb-6 animate-pulse" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Pro Tip</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  You can now configure module-specific passing thresholds. Certificates are awarded instantly when students exceed this alignment target.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
