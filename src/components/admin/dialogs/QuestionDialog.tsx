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
import { Checkbox } from "@/components/ui/checkbox";
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
  Link2,
  Code2,
  Target,
  Grid,
  MapPin,
  ImageIcon as LucideImageIcon,
  ChevronRight
} from "lucide-react";
import { Question, QuestionType } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { HotspotMapperDialog } from './HotspotMapperDialog';
import { useLanguage } from '@/context/language-context';
import { parseRegistryArray, getRegistryValue } from '@/lib/quiz-utils';

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  selectedTestId: string;
  onSave: (data: any, isRequired: boolean) => void;
}

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Single Choice', icon: CheckCircle2 },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: Layers },
  { value: 'true_false', label: 'True/False', icon: CheckCircle2 },
  { value: 'multiple_true_false', label: 'Multiple T/F', icon: ListOrdered },
  { value: 'matrix_choice', label: 'Matrix Choice', icon: Grid },
  { value: 'short_text', label: 'Short Text', icon: Type },
  { value: 'dropdown', label: 'Dropdown', icon: ListOrdered },
  { value: 'ordering', label: 'Ordering', icon: ListOrdered },
  { value: 'matching', icon: Link2, label: 'Matching' },
  { value: 'hotspot', icon: ImageIcon, label: 'Hotspot' },
  { value: 'rating', icon: Star, label: 'Rating' },
];

export function QuestionDialog({ open, onOpenChange, editingItem, selectedTestId, onSave }: QuestionDialogProps) {
  const { t } = useLanguage();
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
        const qTypeRaw = getRegistryValue(editingItem, ['question_type', 'type']);
        const qType = (qTypeRaw || 'single_choice') as QuestionType;
        setSelectedType(qType);
        
        const rawOptions = parseRegistryArray(getRegistryValue(editingItem, ['options', 'choices']));
        const rawCorrect = parseRegistryArray(getRegistryValue(editingItem, ['correct_answer', 'answer']));
        const rawOrderGroup = parseRegistryArray(getRegistryValue(editingItem, ['order_group', 'sequence', 'statements']));

        if (['single_choice', 'multiple_choice', 'dropdown', 'matrix_choice', 'ordering'].includes(qType)) {
          setOptionsList(rawOptions.length > 0 ? rawOptions : ['Option 1', 'Option 2']);
        } else {
          setOptionsList([]);
        }
        
        setCorrectAnswers(rawCorrect);
        setImageUrl(String(getRegistryValue(editingItem, ['image_url', 'image']) || ''));
        setMetadata(String(getRegistryValue(editingItem, ['metadata', 'data']) || ''));
        
        if (qType === 'multiple_true_false' || qType === 'matrix_choice') {
          setMatrixRows(rawOrderGroup);
        } else {
          setMatrixRows([]);
        }

        if (qType === 'matching') {
          const pairs = rawOrderGroup.map(p => {
            const [l, r] = p.split('|');
            return { left: (l || "").trim(), right: (r || "").trim() };
          });
          setMatchingPairs(pairs.length > 0 ? pairs : [{ left: '', right: '' }]);
        }
      } else {
        setSelectedType('single_choice');
        setOptionsList(['Option 1', 'Option 2']);
        setCorrectAnswers([]);
        setMatchingPairs([{ left: '', right: '' }]);
        setMatrixRows([]);
        setImageUrl('');
        setMetadata('');
      }
    }
  }, [open, editingItem]);

  const toggleCorrect = (val: string) => {
    if (selectedType === 'multiple_choice') {
      setCorrectAnswers(prev => 
        prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
      );
    } else {
      setCorrectAnswers([val]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    let finalOptionsArr: string[] = [];
    let finalCorrectArr: string[] = [];
    let finalOrderGroupArr: string[] = [];

    const filteredOptions = optionsList.filter(o => o.trim());

    if (['single_choice', 'multiple_choice', 'dropdown'].includes(selectedType)) {
      finalOptionsArr = filteredOptions;
      finalCorrectArr = correctAnswers.filter(c => c.trim());
    } else if (selectedType === 'true_false') {
      finalOptionsArr = ["True", "False"];
      finalCorrectArr = [correctAnswers[0] || "True"];
    } else if (selectedType === 'ordering') {
      finalOptionsArr = filteredOptions;
      finalOrderGroupArr = filteredOptions;
      finalCorrectArr = filteredOptions;
    } else if (selectedType === 'matching') {
      const validPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim());
      const pairsStr = validPairs.map(p => `${p.left.trim()}|${p.right.trim()}`);
      finalOrderGroupArr = pairsStr;
      finalCorrectArr = pairsStr;
    } else if (selectedType === 'multiple_true_false') {
      finalOrderGroupArr = matrixRows.filter(r => r.trim());
      finalOptionsArr = ["True", "False"];
      finalCorrectArr = correctAnswers.filter(c => c.trim());
    } else if (selectedType === 'matrix_choice') {
      finalOrderGroupArr = matrixRows.filter(r => r.trim());
      finalOptionsArr = filteredOptions;
      finalCorrectArr = correctAnswers.filter(c => c.trim());
    } else if (selectedType === 'short_text') {
      finalCorrectArr = [String(data.correct_answer || "").trim()];
    }

    onSave({
      ...data,
      id: editingItem?.id || `q_${Date.now()}`,
      options: JSON.stringify(finalOptionsArr),
      correct_answer: JSON.stringify(finalCorrectArr),
      order_group: JSON.stringify(finalOrderGroupArr),
      image_url: imageUrl,
      metadata: metadata,
      question_type: selectedType
    }, formData.get('required') === 'on');

    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[85vw] h-[90vh] rounded-[3rem] overflow-hidden p-0 border-none shadow-2xl bg-white flex flex-row">
          
          {/* Left Panel: Question Type Selector */}
          <div className="w-[280px] bg-slate-50 border-r border-slate-100 flex flex-col shrink-0">
            <div className="p-8 border-b border-slate-100 bg-white">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Question Protocol</h3>
              <p className="text-sm font-bold text-slate-900 mt-1">Select Module Type</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value as QuestionType)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
                    selectedType === type.value 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "hover:bg-white text-slate-500 hover:text-slate-900"
                  )}
                >
                  <type.icon className={cn("w-5 h-5", selectedType === type.value ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                  <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
                  {selectedType === type.value && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                </button>
              ))}
            </div>
            <div className="p-6 bg-slate-100/50 mt-auto">
              <p className="text-[9px] font-medium text-slate-400 leading-relaxed text-center italic">
                Choose a module type to configure the behavior of this assessment step.
              </p>
            </div>
          </div>

          {/* Right Panel: Editor Canvas */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    {editingItem ? 'Edit Step' : 'New Assessment Step'}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                    Registry: {selectedTestId} • ID: {editingItem?.id || 'Pending'}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Question Prompt</Label>
                  <Textarea 
                    name="question_text" 
                    defaultValue={getRegistryValue(editingItem, ['question_text', 'text'])} 
                    required 
                    className="rounded-2xl min-h-[120px] text-xl p-6 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 font-medium placeholder:text-slate-300" 
                    placeholder="Type the core question or instruction here..." 
                  />
                </div>

                {/* Media Asset Panel */}
                <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      <LucideImageIcon className="w-4 h-4 text-primary" />
                    </div>
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Visual Context (Optional)</Label>
                  </div>
                  <div className="space-y-4">
                    <Input 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      placeholder="Enter Image URL (Unsplash, Picsum, etc.)" 
                      className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200 focus:ring-primary/40 text-xs font-mono" 
                    />
                    
                    {selectedType === 'hotspot' && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Button 
                          type="button" 
                          onClick={() => setMapperOpen(true)} 
                          disabled={!imageUrl} 
                          className="w-full h-12 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] gap-2 shadow-xl hover:scale-[1.01] transition-all"
                        >
                          <Target className="w-4 h-4" /> Open Spatial Registry Mapper
                        </Button>
                        {!imageUrl && <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest text-center mt-2">A visual asset is required for hotspot mapping</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Logic Configurator */}
                <div className="space-y-6">
                  {/* Standard Options */}
                  {(['single_choice', 'multiple_choice', 'dropdown', 'matrix_choice', 'ordering'].includes(selectedType)) && (
                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                          {selectedType === 'matrix_choice' ? 'Column Choices' : 'Interaction Options'}
                        </Label>
                        <Button type="button" size="sm" onClick={() => setOptionsList([...optionsList, `Option ${optionsList.length + 1}`])} className="rounded-full h-8 px-4 font-bold shadow-sm bg-slate-900 text-white hover:scale-105 transition-transform">
                          <Plus className="w-3 h-3 mr-2" /> Add Choice
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {optionsList.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center group/opt">
                            {['single_choice', 'multiple_choice', 'dropdown'].includes(selectedType) && (
                              <div className="shrink-0 flex items-center justify-center w-10">
                                {selectedType === 'multiple_choice' ? (
                                  <Checkbox checked={correctAnswers.includes(opt)} onCheckedChange={() => toggleCorrect(opt)} />
                                ) : (
                                  <button type="button" onClick={() => toggleCorrect(opt)} className={cn("w-5 h-5 rounded-full border-2 transition-all", correctAnswers.includes(opt) ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/20" : "border-slate-300")} />
                                )}
                              </div>
                            )}
                            <Input value={opt} onChange={(e) => { const n = [...optionsList]; n[i] = e.target.value; setOptionsList(n); }} className="rounded-xl h-12 bg-white flex-1 border-none ring-1 ring-slate-200 focus:ring-primary/40" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => setOptionsList(optionsList.filter((_, idx) => idx !== i))} className="h-12 w-12 text-slate-300 hover:text-destructive transition-colors opacity-0 group-hover/opt:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matrix/MTF Rows */}
                  {(['multiple_true_false', 'matrix_choice'].includes(selectedType)) && (
                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                          {selectedType === 'multiple_true_false' ? 'Statement Sequence' : 'Row Registry'}
                        </Label>
                        <Button type="button" size="sm" onClick={() => setMatrixRows([...matrixRows, `Item ${matrixRows.length + 1}`])} className="rounded-full h-8 px-4 font-bold shadow-sm bg-slate-900 text-white">
                          <Plus className="w-3 h-3 mr-2" /> Add Registry Row
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {matrixRows.map((row, i) => (
                          <div key={i} className="flex gap-2 items-center group/row">
                            <Input value={row} onChange={(e) => { const n = [...matrixRows]; n[i] = e.target.value; setMatrixRows(n); }} className="rounded-xl h-12 bg-white flex-1 font-bold border-none ring-1 ring-slate-200" />
                            
                            {selectedType === 'multiple_true_false' && (
                              <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 shrink-0">
                                {['True', 'False'].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                      const n = [...correctAnswers];
                                      n[i] = val;
                                      setCorrectAnswers(n);
                                    }}
                                    className={cn(
                                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                      correctAnswers[i] === val ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-400 hover:bg-slate-50"
                                    )}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            )}

                            {selectedType === 'matrix_choice' && (
                              <select 
                                value={correctAnswers[i] || ""} 
                                onChange={(e) => { const n = [...correctAnswers]; n[i] = e.target.value; setCorrectAnswers(n); }}
                                className="h-12 rounded-xl bg-white border border-slate-100 px-4 text-[10px] font-black uppercase tracking-widest text-primary w-40 outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                              >
                                <option value="">Map Choice</option>
                                {optionsList.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                              </select>
                            )}

                            <Button type="button" variant="ghost" size="icon" onClick={() => {
                              setMatrixRows(matrixRows.filter((_, idx) => idx !== i));
                              setCorrectAnswers(correctAnswers.filter((_, idx) => idx !== i));
                            }} className="h-12 w-12 text-slate-300 hover:text-destructive opacity-0 group-hover/row:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedType === 'matching' && (
                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Node Matching Pairs</Label>
                        <Button type="button" size="sm" onClick={() => setMatchingPairs([...matchingPairs, { left: '', right: '' }])} className="rounded-full h-8 font-bold bg-slate-900 text-white">
                          <Plus className="w-3 h-3 mr-2" /> New Pair
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {matchingPairs.map((pair, idx) => (
                          <div key={idx} className="flex items-center gap-3 group/pair">
                            <Input value={pair.left} onChange={(e) => { const n = [...matchingPairs]; n[idx].left = e.target.value; setMatchingPairs(n); }} placeholder="Left Node..." className="rounded-xl h-12 bg-white flex-1 border-none ring-1 ring-slate-200" />
                            <Link2 className="w-4 h-4 text-slate-300 shrink-0" />
                            <Input value={pair.right} onChange={(e) => { const n = [...matchingPairs]; n[idx].right = e.target.value; setMatchingPairs(n); }} placeholder="Right Node..." className="rounded-xl h-12 bg-white flex-1 border-none ring-1 ring-slate-200" />
                            <Button type="button" variant="ghost" onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-destructive h-12 w-12 opacity-0 group-hover/pair:opacity-100 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedType === 'true_false' && (
                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Boolean Resolution</Label>
                      <RadioGroup value={correctAnswers[0] || "True"} onValueChange={(val) => setCorrectAnswers([val])} className="flex gap-4">
                        {['True', 'False'].map((val) => (
                          <div key={val} className={cn("flex-1 flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all", correctAnswers[0] === val ? "bg-white border-primary shadow-lg shadow-primary/5" : "bg-white border-slate-100")} onClick={() => setCorrectAnswers([val])}>
                            <RadioGroupItem value={val} id={`tf-dlg-${val}`} />
                            <Label htmlFor={`tf-dlg-${val}`} className="font-black uppercase tracking-widest text-sm cursor-pointer">{val}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {selectedType === 'short_text' && (
                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Target Literal Answer</Label>
                      <Input 
                        name="correct_answer" 
                        defaultValue={correctAnswers[0] || ""} 
                        placeholder="Enter the exact correct response..." 
                        className="h-14 rounded-xl bg-white font-bold text-lg border-none ring-1 ring-slate-200 focus:ring-primary/40" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Action Footer */}
            <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <Checkbox id="required" name="required" defaultChecked={String(getRegistryValue(editingItem, ['required'])).toUpperCase() === "TRUE"} className="w-5 h-5" />
                <Label htmlFor="required" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 cursor-pointer">Required Mission Step</Label>
              </div>
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full px-8 h-14 font-bold text-slate-400 hover:text-slate-900 transition-colors">Discard</Button>
                <Button type="submit" className="rounded-full px-12 h-16 font-black text-lg shadow-2xl bg-primary hover:scale-[1.02] transition-all border-none shadow-primary/30">
                  <Save className="w-5 h-5 mr-3" /> Commit Registry Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <HotspotMapperDialog open={mapperOpen} onOpenChange={setMapperOpen} imageUrl={imageUrl} initialData={metadata} onSave={(data) => setMetadata(data)} />
    </>
  );
}
