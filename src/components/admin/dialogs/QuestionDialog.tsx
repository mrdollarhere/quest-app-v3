
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Save, 
  HelpCircle, 
  CheckCircle2, 
  Image as ImageIcon, 
  Layers, 
  ListOrdered, 
  Type, 
  Star, 
  Plus, 
  Trash2,
  Check,
  Circle,
  Link2,
  Code2,
  AlertCircle,
  Target
} from "lucide-react";
import { Question, QuestionType } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { HotspotMapperDialog } from './HotspotMapperDialog';

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  selectedTestId: string;
  onSave: (data: any, isRequired: boolean) => void;
}

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Single Choice', icon: CheckCircle2, desc: 'One correct answer' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: Layers, desc: 'Select many' },
  { value: 'true_false', label: 'True/False', icon: CheckCircle2, desc: 'Binary' },
  { value: 'short_text', label: 'Short Text', icon: Type, desc: 'Open ended' },
  { value: 'dropdown', label: 'Dropdown', icon: ListOrdered, desc: 'Selection list' },
  { value: 'ordering', label: 'Ordering', icon: ListOrdered, desc: 'Sequence' },
  { value: 'matching', icon: Link2, label: 'Matching', desc: 'Connect pairs' },
  { value: 'hotspot', icon: ImageIcon, label: 'Hotspot', desc: 'Visual selection' },
  { value: 'rating', icon: Star, label: 'Rating', desc: 'Satisfaction scale' },
];

export function QuestionDialog({ open, onOpenChange, editingItem, selectedTestId, onSave }: QuestionDialogProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>('single_choice');
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<{left: string, right: string}[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [metadata, setMetadata] = useState('');
  const [mapperOpen, setMapperOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setSelectedType(editingItem.question_type as QuestionType);
        const opts = editingItem.options ? editingItem.options.split(',').map((o: string) => o.trim()) : [];
        setOptionsList(opts);
        const corrects = editingItem.correct_answer ? editingItem.correct_answer.split(',').map((c: string) => c.trim()) : [];
        setCorrectAnswers(corrects);
        setImageUrl(editingItem.image_url || '');
        setMetadata(editingItem.metadata || '');

        if (editingItem.question_type === 'matching') {
          const pairs = editingItem.order_group 
            ? editingItem.order_group.split(',').map((p: string) => {
                const [l, r] = p.split('|');
                return { left: (l || "").trim(), right: (r || "").trim() };
              })
            : [{ left: '', right: '' }];
          setMatchingPairs(pairs);
        } else {
          setMatchingPairs([{ left: '', right: '' }]);
        }
      } else {
        setSelectedType('single_choice');
        setOptionsList(['Option 1', 'Option 2']);
        setCorrectAnswers([]);
        setMatchingPairs([{ left: '', right: '' }]);
        setImageUrl('');
        setMetadata('');
      }
    }
  }, [open, editingItem]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    let finalOptions = data.options as string;
    let finalCorrect = data.correct_answer as string;
    let finalOrderGroup = data.order_group as string;

    if (['single_choice', 'multiple_choice', 'dropdown'].includes(selectedType)) {
      finalOptions = optionsList.filter(o => o.trim()).join(', ');
      finalCorrect = correctAnswers.filter(c => c.trim()).join(', ');
    } else if (selectedType === 'true_false') {
      finalOptions = "True, False";
      finalCorrect = correctAnswers[0] || "";
    } else if (selectedType === 'matching') {
      const validPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim());
      const pairsStr = validPairs.map(p => `${p.left.trim()}|${p.right.trim()}`).join(', ');
      finalOrderGroup = pairsStr;
      finalCorrect = pairsStr;
    }

    onSave({
      ...data,
      options: finalOptions,
      correct_answer: finalCorrect,
      order_group: finalOrderGroup,
      image_url: imageUrl,
      metadata: metadata
    }, formData.get('required') === 'on');

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px] rounded-[3rem] max-h-[92vh] overflow-hidden p-0 border-none shadow-2xl bg-white flex flex-col">
          <div className="bg-slate-900 p-10 text-white shrink-0 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Code2 className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-primary p-3 rounded-2xl shadow-xl rotate-3">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                  {editingItem ? 'Update Intelligence' : 'Inject Intelligence'}
                </DialogTitle>
                <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                  Configuring Bank for Registry: {selectedTestId}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            <div className="space-y-4">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Interaction Module</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value as QuestionType)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-left group",
                      selectedType === type.value 
                        ? "bg-primary/5 border-primary shadow-md ring-4 ring-primary/5" 
                        : "bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white"
                    )}
                  >
                    <type.icon className={cn("w-5 h-5", selectedType === type.value ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-tight", selectedType === type.value ? "text-primary" : "text-slate-500")}>
                      {type.label}
                    </span>
                    <input type="radio" name="question_type" value={type.value} checked={selectedType === type.value} readOnly className="hidden" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                  Question Prompt
                  <span className="text-primary animate-pulse flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Required
                  </span>
                </Label>
                <Textarea name="question_text" defaultValue={editingItem?.question_text} required placeholder="What would you like to ask?" className="rounded-[1.5rem] min-h-[100px] text-xl font-medium p-6 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Internal Reference</Label>
                  <Input name="id" defaultValue={editingItem?.id} placeholder="auto-generated-id" className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-100 font-mono text-xs" disabled={!!editingItem} />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-4 py-3 px-6 bg-slate-50 rounded-2xl border border-slate-100 w-full hover:bg-white transition-colors cursor-pointer group">
                    <input type="checkbox" name="required" id="q_required_dlg" className="w-5 h-5 rounded-md border-2 border-slate-200 accent-primary" defaultChecked={editingItem?.required === "TRUE" || editingItem?.required === true} />
                    <Label htmlFor="q_required_dlg" className="font-black uppercase tracking-widest text-[10px] cursor-pointer text-slate-500 group-hover:text-primary transition-colors">Compulsory Action</Label>
                  </div>
                </div>
              </div>

              {(['single_choice', 'multiple_choice', 'dropdown'].includes(selectedType)) && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Available Options</Label>
                    <Button type="button" size="sm" onClick={() => setOptionsList([...optionsList, `Option ${optionsList.length + 1}`])} className="rounded-full h-8 gap-1.5 font-bold shadow-sm">
                      <Plus className="w-3 h-3" /> Add Choice
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {optionsList.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Input 
                          value={option} 
                          onChange={(e) => {
                            const newList = [...optionsList];
                            newList[idx] = e.target.value;
                            setOptionsList(newList);
                            if (correctAnswers.includes(option)) setCorrectAnswers(correctAnswers.map(c => c === option ? e.target.value : c));
                          }}
                          className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedType(prev => {
                            if (selectedType === 'multiple_choice') setCorrectAnswers(prev => prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]);
                            else setCorrectAnswers([option]);
                            return selectedType;
                          })}
                          className={cn("w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all", correctAnswers.includes(option) ? "bg-green-500 border-green-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-300")}
                        >
                          {selectedType === 'multiple_choice' ? <Check className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                        </button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setOptionsList(optionsList.filter((_, i) => i !== idx))} disabled={optionsList.length <= 1} className="h-12 w-12 rounded-xl text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === 'matching' && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Pair Configuration</Label>
                    <Button type="button" size="sm" onClick={() => setMatchingPairs([...matchingPairs, { left: '', right: '' }])} className="rounded-full h-8 font-bold bg-slate-900 text-white"><Plus className="w-3 h-3 mr-2" /> New Pair</Button>
                  </div>
                  {matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input value={pair.left} onChange={(e) => { const n = [...matchingPairs]; n[idx].left = e.target.value; setMatchingPairs(n); }} placeholder="Prompt..." className="rounded-xl h-12 bg-white" />
                      <Link2 className="w-4 h-4 text-slate-300" />
                      <Input value={pair.right} onChange={(e) => { const n = [...matchingPairs]; n[idx].right = e.target.value; setMatchingPairs(n); }} placeholder="Target..." className="rounded-xl h-12 bg-white" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))} disabled={matchingPairs.length <= 1} className="h-12 w-12 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedType === 'true_false' && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Correct Intelligence Outcome</Label>
                  <RadioGroup value={correctAnswers[0] || ""} onValueChange={(val) => setCorrectAnswers([val])} className="flex gap-4">
                    {['True', 'False'].map((val) => (
                      <div key={val} className={cn("flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer bg-white", correctAnswers[0] === val ? "border-primary ring-4 ring-primary/5 shadow-md" : "border-slate-100")} onClick={() => setCorrectAnswers([val])}>
                        <RadioGroupItem value={val} id={`tf-dlg-${val}`} />
                        <Label htmlFor={`tf-dlg-${val}`} className="font-black uppercase tracking-widest text-xs cursor-pointer">{val}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {selectedType === 'ordering' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Available Sequence Items</Label>
                    <Input name="order_group" defaultValue={editingItem?.order_group} placeholder="A, B, C" className="rounded-xl h-12 bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Target Sequence (Correct)</Label>
                    <Input name="correct_answer" defaultValue={editingItem?.correct_answer} placeholder="Correct order..." className="rounded-xl h-12 bg-white" />
                  </div>
                </div>
              )}

              {selectedType === 'short_text' && (
                <div className="space-y-2 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Expected Match Key</Label>
                  <Input name="correct_answer" defaultValue={editingItem?.correct_answer} placeholder="Exact string for validation..." className="rounded-xl h-14 bg-white" />
                </div>
              )}

              {(selectedType === 'hotspot' || imageUrl) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900 rounded-[2.5rem] text-white">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Visual Asset URL</Label>
                      <Input 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..." 
                        className="rounded-xl h-12 bg-slate-800 border-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2"><Code2 className="w-3 h-3" /> Spatial Metadata (JSON)</Label>
                      <Input 
                        value={metadata} 
                        onChange={(e) => setMetadata(e.target.value)}
                        placeholder='[{"id":"z1","label":"Target","x":50,"y":50,"radius":10}]' 
                        className="rounded-xl h-12 bg-slate-800 border-none font-mono text-[10px]" 
                      />
                    </div>
                  </div>
                  {selectedType === 'hotspot' && (
                    <div className="flex justify-center px-8">
                      <Button 
                        type="button"
                        onClick={() => setMapperOpen(true)}
                        className="w-full h-14 rounded-full bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 font-black uppercase text-xs tracking-widest shadow-lg gap-3"
                      >
                        <Target className="w-5 h-5 text-primary" />
                        Launch Intelligence Mapper
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-8 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 mt-auto">
              <Button type="submit" className="rounded-full w-full h-16 font-black text-xl shadow-2xl transition-all hover:scale-[1.02] bg-primary">
                <Save className="w-5 h-5 mr-3" />
                Sync with Question Bank
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <HotspotMapperDialog 
        open={mapperOpen}
        onOpenChange={setMapperOpen}
        imageUrl={imageUrl}
        initialData={metadata}
        onSave={(data) => setMetadata(data)}
      />
    </>
  );
}
