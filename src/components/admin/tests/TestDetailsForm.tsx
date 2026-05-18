
/**
 * TestDetailsForm.tsx
 * 
 * Purpose: Modular form section for primary test metadata.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, Gauge, Clock, Image as ImageIcon } from "lucide-react";

interface TestDetailsFormProps {
  difficulty: string;
  setDifficulty: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
}

export function TestDetailsForm({ difficulty, setDifficulty, imageUrl, setImageUrl }: TestDetailsFormProps) {
  return (
    <Card className="border-none shadow-2xl rounded-none overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
        <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
          <LayoutGrid className="w-5 h-5 text-primary" /> Test Details
        </CardTitle>
        <CardDescription className="dark:text-slate-400">Primary information about this test.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Test ID (Optional)</Label>
            <Input name="id" placeholder="leave blank for auto-id" className="h-12 rounded-none bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Category</Label>
            <Input name="category" placeholder="Math, English, etc." className="h-12 rounded-none bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 font-bold" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Test Title <span className="text-destructive font-black">*</span></Label>
          <Input name="title" required placeholder="Name of your test" className="h-14 rounded-none bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 font-black text-lg" />
        </div>

        <div className="space-y-2">
          <Label className="font-black text-[10px] uppercase text-slate-400 ml-1">Description</Label>
          <Textarea name="description" placeholder="A brief summary..." className="min-h-[120px] rounded-none bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-100 p-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1 flex items-center gap-2"><Gauge className="w-3 h-3" /> Difficulty *</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-12 rounded-none bg-slate-50 ring-1 ring-slate-100 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="rounded-none border-none shadow-2xl"><SelectItem value="Easy" className="font-bold">Easy</SelectItem><SelectItem value="Medium" className="font-bold">Medium</SelectItem><SelectItem value="Hard" className="font-bold">Hard</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase text-slate-400 ml-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Time Limit *</Label>
            <div className="flex items-center gap-3"><Input name="duration" type="number" required placeholder="e.g. 15" className="h-12 rounded-none bg-slate-50 ring-1 ring-slate-100 border-none font-bold flex-1" /><span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-3.5 rounded-none border">min</span></div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Label className="font-black text-[10px] uppercase text-slate-400 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Cover Image URL</Label>
          <Input name="image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="h-12 rounded-none bg-slate-50 ring-1 ring-slate-100 border-none font-mono text-xs" />
          {imageUrl && <div className="rounded-none overflow-hidden border-2 border-slate-100 aspect-[16/6] bg-slate-50 flex items-center justify-center relative"><img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /><div className="absolute top-2 left-2 bg-black/40 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase">Live Preview</div></div>}
        </div>
      </CardContent>
    </Card>
  );
}
