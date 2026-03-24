"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
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
  Target,
  Grid
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
  { value: 'single_choice', label: 'Single Choice', icon: CheckCircle2, desc: 'One correct' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: Layers, desc: 'Select many' },
  { value: 'true_false', label: 'True/False', icon: CheckCircle2, desc: 'Binary' },
  { value: 'multiple_true_false', label: 'Multi T/F', icon: ListOrdered, desc: 'List of binary' },
  { value: 'matrix_choice', label: 'Matrix', icon: Grid, desc: 'Grid selector' },
  { value: 'short_text', label: 'Short Text', icon: Type, desc: 'Open ended' },
  { value: 'dropdown', label: 'Dropdown', icon: ListOrdered, desc: 'List select' },
  { value: 'ordering', label: 'Ordering', icon: ListOrdered, desc: 'Sequence' },
  { value: 'matching', icon: Link2, label: 'Matching', desc: 'Connect pairs' },
  { value: 'hotspot', icon: ImageIcon, label: 'Hotspot', desc: 'Visual click' },
  { value: 'rating', icon: Star, label: 'Rating', desc: 'Sat. scale' },
];

export function QuestionDialog({ open, onOpenChange, editingItem, selectedTestId, onSave }: QuestionDialogProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>('single_choice');
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<{left: string, right: string}[]>([]);
  const [matrixRows, setMatrixRows] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [metadata, setMetadata] = useState('');
  const [mapperOpen, setMapperOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setSelectedType(editingItem.question_type as QuestionType);
        
        // Load sequence items from order_group if it's an ordering question
        const rawOptions = (editingItem.question_type === 'ordering') 
          ? editingItem.order_group 
          : editingItem.options;
          
        setOptionsList(rawOptions ? rawOptions.split(',').map((o: string) => o.trim()) : []);
        setCorrectAnswers(editingItem.correct_answer ? editingItem.correct_answer.split(',').map((c: string) => c.trim()) : []);
        setImageUrl(editingItem.image_url || '');
        setMetadata(editingItem.metadata || '');
        setMatrixRows(editingItem.order_group ? editingItem.order_group.split(',').map((r: string) => r.trim()) : []);

        if (editingItem.question_type === 'matching') {
          const pairs = editingItem.order_group?.split(',').map((p: string) => {
            const [l, r] = p.split('|');
            return { left: (l || "").trim(), right: (r || "").trim() };
          }) || [{ left: '', right: '' }];
          setMatchingPairs(pairs);
        }
      } else {
        setSelectedType('single_choice');
        setOptionsList(['Option 1', 'Option 2']);
        setCorrectAnswers([]);
        setMatchingPairs([{ left: '', right: '' }]);
        setMatrixRows(['Row 1']);
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

    const filteredOptions = optionsList.filter(o => o.trim());

    if (['single_choice', 'multiple_choice', 'dropdown', 'matrix_choice'].includes(selectedType)) {
      finalOptions = filteredOptions.join(', ');
      finalCorrect = correctAnswers.filter(c => c.trim()).join(', ');
    } else if (selectedType === 'true_false') {
      finalOptions = "True, False";
      finalCorrect = correctAnswers[0] || "";
    } else if (selectedType === 'ordering') {
      // Ordering uses order_group for the items and correct_answer for the sequence
      finalOrderGroup = filteredOptions.join(', ');
      finalCorrect = filteredOptions.join(', '); // Entered order is correct
      finalOptions = "";
    } else if (selectedType === 'matching') {
      const validPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim());
      const pairsStr = validPairs.map(p => `${p.left.trim()}|${p.right.trim()}`).join(', ');
      finalOrderGroup = pairsStr;
      finalCorrect = pairsStr;
    } else if (selectedType === 'multiple_true_false' || selectedType === 'matrix_choice') {
      finalOrderGroup = matrixRows.filter(r => r.trim()).join(', ');
      finalCorrect = correctAnswers.filter(c => c.trim()).join(', ');
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
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] max-h-[92vh] overflow-hidden p-0 border-none shadow-2xl bg-white flex flex-col">
          <div className="bg-slate-900 p-10 text-white shrink-0 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Code2 className="w-32 h-32" /></div>
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-xl rotate-3"><HelpCircle className="w-6 h-6 text-white" /></div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tight">{editingItem ? 'Edit Protocol' : 'Inject Protocol'}</DialogTitle>
                <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Registry: {selectedTestId}</DialogDescription>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            <div className="space-y-4">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Logic Module</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUESTION_TYPES.map((type) => (
                  <button key={type.value} type="button" onClick={() => setSelectedType(type.value as QuestionType)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group", selectedType === type.value ? "bg-primary/5 border-primary" : "bg-slate-50 border-slate-100 hover:border-slate-300")}>
                    <type.icon className={cn("w-4 h-4", selectedType === type.value ? "text-primary" : "text-slate-400")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-tight", selectedType === type.value ? "text-primary" : "text-slate-500")}>{type.label}</span>
                    <input type="radio" name="question_type" value={type.value} checked={selectedType === type.value} readOnly className="hidden" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Question Prompt</Label>
                <Textarea name="question_text" defaultValue={editingItem?.question_text} required className="rounded-[1.5rem] min-h-[100px] text-lg p-6 bg-slate-50 border-none ring-1 ring-slate-100" />
              </div>

              {(['single_choice', 'multiple_choice', 'dropdown', 'matrix_choice', 'ordering'].includes(selectedType)) && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                      {selectedType === 'ordering' ? 'Sequence Items' : 'Columns / Options'}
                    </Label>
                    <Button type="button" size="sm" onClick={() => setOptionsList([...optionsList, `Item ${optionsList.length + 1}`])} className="rounded-full h-8 px-4 font-bold shadow-sm"><Plus className="w-3 h-3 mr-2" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {optionsList.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={opt} onChange={(e) => { const n = [...optionsList]; n[i] = e.target.value; setOptionsList(n); }} className="rounded-xl h-10 bg-white" placeholder={selectedType === 'ordering' ? "Sequence step..." : "Option text..."} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => setOptionsList(optionsList.filter((_, idx) => idx !== i))} className="h-10 w-10 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                  {selectedType === 'ordering' && (
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">Note: Enter items in their correct final order.</p>
                  )}
                </div>
              )}

              {(['multiple_true_false', 'matrix_choice'].includes(selectedType)) && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Rows / Statements</Label>
                    <Button type="button" size="sm" onClick={() => { setMatrixRows([...matrixRows, `Row ${matrixRows.length + 1}`]); setCorrectAnswers([...correctAnswers, '']); }} className="rounded-full h-8 px-4 font-bold shadow-sm"><Plus className="w-3 h-3 mr-2" /> Add</Button>
                  </div>
                  <div className="space-y-3">
                    {matrixRows.map((row, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <Input value={row} onChange={(e) => { const n = [...matrixRows]; n[i] = e.target.value; setMatrixRows(n); }} className="rounded-xl h-10 bg-white flex-1" />
                        {selectedType === 'matrix_choice' ? (
                          <select value={correctAnswers[i] || ''} onChange={(e) => { const n = [...correctAnswers]; n[i] = e.target.value; setCorrectAnswers(n); }} className="h-10 px-4 rounded-xl border-none ring-1 ring-slate-200 bg-white text-xs font-bold w-40">
                            <option value="">Select Correct</option>
                            {optionsList.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <select value={correctAnswers[i] || ''} onChange={(e) => { const n = [...correctAnswers]; n[i] = e.target.value; setCorrectAnswers(n); }} className="h-10 px-4 rounded-xl border-none ring-1 ring-slate-200 bg-white text-xs font-bold w-40">
                            <option value="">Select Correct</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        )}
                        <Button type="button" variant="ghost" onClick={() => { setMatrixRows(matrixRows.filter((_, idx) => idx !== i)); setCorrectAnswers(correctAnswers.filter((_, idx) => idx !== i)); }} className="h-10 w-10 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === 'matching' && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between"><Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Pair Configuration</Label><Button type="button" size="sm" onClick={() => setMatchingPairs([...matchingPairs, { left: '', right: '' }])} className="rounded-full h-8 font-bold"><Plus className="w-3 h-3 mr-2" /> New Pair</Button></div>
                  {matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input value={pair.left} onChange={(e) => { const n = [...matchingPairs]; n[idx].left = e.target.value; setMatchingPairs(n); }} placeholder="Prompt..." className="rounded-xl h-10 bg-white" />
                      <Link2 className="w-4 h-4 text-slate-300" />
                      <Input value={pair.right} onChange={(e) => { const n = [...matchingPairs]; n[idx].right = e.target.value; setMatchingPairs(n); }} placeholder="Target..." className="rounded-xl h-10 bg-white" />
                      <Button type="button" variant="ghost" onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedType === 'true_false' && (
                <RadioGroup value={correctAnswers[0] || ""} onValueChange={(val) => setCorrectAnswers([val])} className="flex gap-4 p-8 bg-slate-50 rounded-[2rem] border-2">
                  {['True', 'False'].map((val) => (
                    <div key={val} className={cn("flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer bg-white", correctAnswers[0] === val ? "border-primary" : "border-slate-100")} onClick={() => setCorrectAnswers([val])}>
                      <RadioGroupItem value={val} id={`tf-dlg-${val}`} /><Label htmlFor={`tf-dlg-${val}`} className="font-black uppercase tracking-widest text-xs cursor-pointer">{val}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <DialogFooter className="pt-8 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4">
              <Button type="submit" className="rounded-full w-full h-16 font-black text-xl shadow-2xl bg-primary">
                <Save className="w-5 h-5 mr-3" /> Commit Registry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <HotspotMapperDialog open={mapperOpen} onOpenChange={setMapperOpen} imageUrl={imageUrl} initialData={metadata} onSave={(data) => setMetadata(data)} />
    </>
  );
}
