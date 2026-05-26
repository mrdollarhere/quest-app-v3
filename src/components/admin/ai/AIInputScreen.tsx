"use client";

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, FileText, Settings2, Languages, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export function AIInputScreen({ onGenerate }: { onGenerate: (config: any) => void }) {
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState<'vi' | 'en' | 'both'>('vi');
  const [types, setTypes] = useState<string[]>(['single_choice', 'multiple_choice']);

  const toggleType = (t: string) => {
    setTypes(prev => prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]);
  };

  const handleStart = () => {
    if (!topic.trim()) return;
    onGenerate({ topic, sourceText, questionCount, difficulty, language, questionTypes: types });
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-violet-600" />
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Context</Label>
        </div>
        <Input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Internet Safety and Cyberbullying / An toàn internet"
          className="h-14 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-violet-400 text-lg font-black"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-violet-600" />
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Material (Optional)</Label>
          </div>
          <span className="text-[9px] font-black text-slate-300">{sourceText.length}/2000</span>
        </div>
        <Textarea 
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value.slice(0, 2000))}
          placeholder="Paste content snippet, lesson notes, or detailed instructions..."
          className="min-h-[120px] rounded-[2rem] bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-violet-400 p-6 font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-violet-600" />
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logic Calibration</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
              <span>Question Count</span>
              <span className="text-violet-600 font-black">{questionCount} Nodes</span>
            </div>
            <Slider value={[questionCount]} onValueChange={(v) => setQuestionCount(v[0])} min={1} max={10} step={1} />
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black text-slate-400 uppercase">Difficulty Tier</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {['Easy', 'Medium', 'Hard'].map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-violet-600" />
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Output Registry</Label>
          </div>

          <RadioGroup value={language} onValueChange={(v: any) => setLanguage(v)} className="grid grid-cols-1 gap-2">
            {[
              { id: 'vi', label: 'Vietnamese' },
              { id: 'en', label: 'English' },
              { id: 'both', label: 'Bilingual / Song ngữ' }
            ].map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                <RadioGroupItem value={l.id} id={`lang-${l.id}`} />
                <Label htmlFor={`lang-${l.id}`} className="font-bold text-xs cursor-pointer">{l.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Included Modalities</Label>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'single_choice', label: 'Single Choice' },
            { id: 'multiple_choice', label: 'Multiple Choice' },
            { id: 'true_false', label: 'True / False' },
            { id: 'short_text', label: 'Short Text' }
          ].map(t => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Checkbox id={`type-${t.id}`} checked={types.includes(t.id)} onCheckedChange={() => toggleType(t.id)} />
              <Label htmlFor={`type-${t.id}`} className="text-[10px] font-black uppercase cursor-pointer">{t.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
        <Button 
          onClick={handleStart} 
          disabled={!topic.trim() || types.length === 0}
          className="h-20 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-black text-2xl uppercase tracking-tighter shadow-2xl shadow-violet-500/20 transition-all hover:scale-[1.02]"
        >
          Generate Questions <Sparkles className="w-6 h-6 ml-3 fill-current" />
        </Button>
        <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest leading-relaxed">
          Google Gemini AI Handshake Active. Review all generated nodes before registry commitment.
        </p>
      </div>
    </div>
  );
}
