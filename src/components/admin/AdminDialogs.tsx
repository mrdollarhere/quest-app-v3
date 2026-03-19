
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Settings2,
  AlertCircle
} from "lucide-react";
import { Question, QuestionType } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdminDialogsProps {
  dialogs: {
    test: boolean;
    user: boolean;
    question: boolean;
    bulk: boolean;
  };
  setDialogs: (dialogs: any) => void;
  editingItem: any;
  selectedTestId: string;
  questions: Question[];
  onSaveTest: (data: any) => void;
  onSaveUser: (data: any) => void;
  onSaveQuestion: (data: any, isRequired: boolean) => void;
  onSaveBulk: (json: string) => void;
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

export function AdminDialogs({ 
  dialogs, 
  setDialogs, 
  editingItem, 
  selectedTestId, 
  questions,
  onSaveTest, 
  onSaveUser, 
  onSaveQuestion, 
  onSaveBulk 
}: AdminDialogsProps) {
  // --- STATE ---
  const [questionJson, setQuestionJson] = useState("");
  const [selectedType, setSelectedType] = useState<QuestionType>('single_choice');
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<{left: string, right: string}[]>([]);

  // --- HYDRATION ---
  useEffect(() => {
    if (dialogs.bulk) setQuestionJson(JSON.stringify(questions, null, 2));
  }, [dialogs.bulk, questions]);

  useEffect(() => {
    if (dialogs.question) {
      if (editingItem) {
        setSelectedType(editingItem.question_type as QuestionType);
        
        // Options Sync
        const opts = editingItem.options ? editingItem.options.split(',').map((o: string) => o.trim()) : [];
        setOptionsList(opts);
        
        // Correct Answers Sync
        const corrects = editingItem.correct_answer ? editingItem.correct_answer.split(',').map((c: string) => c.trim()) : [];
        setCorrectAnswers(corrects);

        // Matching Pairs Sync
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
        // Reset for new question
        setSelectedType('single_choice');
        setOptionsList(['Option 1', 'Option 2']);
        setCorrectAnswers([]);
        setMatchingPairs([{ left: '', right: '' }]);
      }
    }
  }, [dialogs.question, editingItem]);

  // --- HANDLERS ---
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    onSaveQuestion({
      ...data,
      options: finalOptions,
      correct_answer: finalCorrect,
      order_group: finalOrderGroup,
    }, formData.get('required') === 'on');

    setDialogs({...dialogs, question: false});
  };

  // --- RENDER HELPERS ---
  const renderTypeSelector = () => (
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
  );

  const renderChoiceBuilder = () => (
    <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Available Options</Label>
          <span className="text-[9px] font-bold text-slate-400 italic">Mark correct items on the right</span>
        </div>
        <Button type="button" size="sm" onClick={() => setOptionsList([...optionsList, `Option ${optionsList.length + 1}`])} className="rounded-full h-8 gap-1.5 font-bold shadow-sm">
          <Plus className="w-3 h-3" /> Add Choice
        </Button>
      </div>
      
      <div className="space-y-3">
        {optionsList.map((option, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
            <Input 
              value={option} 
              onChange={(e) => {
                const newList = [...optionsList];
                newList[idx] = e.target.value;
                setOptionsList(newList);
                if (correctAnswers.includes(option)) {
                  setCorrectAnswers(correctAnswers.map(c => c === option ? e.target.value : c));
                }
              }}
              placeholder={`Option ${idx + 1}`}
              className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200 focus:ring-primary/40 font-medium"
            />
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedType === 'multiple_choice') {
                    setCorrectAnswers(prev => prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]);
                  } else {
                    setCorrectAnswers([option]);
                  }
                }}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all",
                  correctAnswers.includes(option) 
                    ? "bg-green-500 border-green-600 text-white shadow-lg" 
                    : "bg-white border-slate-200 text-slate-300 hover:border-green-400 hover:text-green-500"
                )}
              >
                {selectedType === 'multiple_choice' ? <Check className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
              </button>

              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setOptionsList(optionsList.filter((_, i) => i !== idx));
                  setCorrectAnswers(correctAnswers.filter(c => c !== option));
                }}
                disabled={optionsList.length <= 1}
                className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatchingBuilder = () => (
    <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Pair Configuration</Label>
          <span className="text-[9px] font-bold text-slate-400 italic">Prompt (Left) maps to Target (Right)</span>
        </div>
        <Button type="button" size="sm" onClick={() => setMatchingPairs([...matchingPairs, { left: '', right: '' }])} className="rounded-full h-8 gap-1.5 font-bold bg-slate-900 text-white shadow-lg">
          <Plus className="w-3 h-3" /> New Pair
        </Button>
      </div>
      
      <div className="space-y-4">
        {matchingPairs.map((pair, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex-1 space-y-1">
              <Input 
                value={pair.left} 
                onChange={(e) => {
                  const newPairs = [...matchingPairs];
                  newPairs[idx].left = e.target.value;
                  setMatchingPairs(newPairs);
                }}
                placeholder="Prompt..."
                className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200 focus:ring-primary/40"
              />
            </div>
            
            <Link2 className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex-1 space-y-1">
              <Input 
                value={pair.right} 
                onChange={(e) => {
                  const newPairs = [...matchingPairs];
                  newPairs[idx].right = e.target.value;
                  setMatchingPairs(newPairs);
                }}
                placeholder="Target..."
                className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200 border-dashed focus:ring-primary/40"
              />
            </div>

            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))}
              disabled={matchingPairs.length <= 1}
              className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* TEST DIALOG */}
      <Dialog open={dialogs.test} onOpenChange={(val) => setDialogs({...dialogs, test: val})}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-primary p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Settings2 className="w-24 h-24" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight mb-2">
              {editingItem ? 'Edit Module' : 'Register Module'}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium text-sm italic">
              Synchronizing with DNTRNG global registry.
            </DialogDescription>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSaveTest(Object.fromEntries(formData.entries()));
            setDialogs({...dialogs, test: false});
          }} className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Unique ID</Label>
                <Input name="id" defaultValue={editingItem?.id} placeholder="auto-generated" disabled={!!editingItem} className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200 font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Category</Label>
                <Input name="category" defaultValue={editingItem?.category} placeholder="e.g. Logic" className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200 font-bold" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Display Title</Label>
              <Input name="title" defaultValue={editingItem?.title} required placeholder="The Ultimate Challenge" className="rounded-xl h-14 bg-slate-50 border-none ring-1 ring-slate-200 font-black text-lg" />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Intelligence Description</Label>
              <Textarea name="description" defaultValue={editingItem?.description} placeholder="Describe the learning objectives..." className="rounded-2xl min-h-[100px] bg-slate-50 border-none ring-1 ring-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Complexity</Label>
                <Input name="difficulty" defaultValue={editingItem?.difficulty} placeholder="Advanced" className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Duration</Label>
                <Input name="duration" defaultValue={editingItem?.duration} placeholder="15m" className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200 font-bold" />
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button type="submit" className="rounded-full w-full h-16 font-black text-xl shadow-2xl transition-all hover:scale-[1.02] bg-primary">
                <Save className="w-5 h-5 mr-3" />
                Commit Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUESTION DIALOG */}
      <Dialog open={dialogs.question} onOpenChange={(val) => setDialogs({...dialogs, question: val})}>
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
          
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            
            {renderTypeSelector()}

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                  Question Prompt
                  <span className="text-primary animate-pulse flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Required
                  </span>
                </Label>
                <Textarea name="question_text" defaultValue={editingItem?.question_text} required placeholder="What would you like to ask the student?" className="rounded-[1.5rem] min-h-[100px] text-xl font-medium p-6 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40" />
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

              {/* DYNAMIC MODULES */}
              {(['single_choice', 'multiple_choice', 'dropdown'].includes(selectedType)) && renderChoiceBuilder()}
              {selectedType === 'matching' && renderMatchingBuilder()}

              {/* BINARY UI */}
              {selectedType === 'true_false' && (
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Correct Intelligence Outcome</Label>
                  <RadioGroup 
                    value={correctAnswers[0] || ""} 
                    onValueChange={(val) => setCorrectAnswers([val])}
                    className="flex gap-4"
                  >
                    {['True', 'False'].map((val) => (
                      <div key={val} className={cn(
                        "flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white group",
                        correctAnswers[0] === val ? "border-primary ring-4 ring-primary/5 shadow-md" : "border-slate-100 hover:border-slate-300"
                      )} onClick={() => setCorrectAnswers([val])}>
                        <RadioGroupItem value={val} id={`tf-dlg-${val}`} />
                        <Label htmlFor={`tf-dlg-${val}`} className="font-black uppercase tracking-widest text-xs cursor-pointer text-slate-700">{val}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* ORDERING UI */}
              {selectedType === 'ordering' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Available Sequence Items</Label>
                    <Input name="order_group" defaultValue={editingItem?.order_group} placeholder="A, B, C" className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200" />
                    <p className="text-[9px] font-bold text-slate-400 italic">Comma separated, shuffled for users.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Target Sequence (Correct)</Label>
                    <Input name="correct_answer" defaultValue={editingItem?.correct_answer} placeholder="Correct order..." className="rounded-xl h-12 bg-white border-none ring-1 ring-slate-200 font-mono text-xs" />
                  </div>
                </div>
              )}

              {/* TEXT KEY UI */}
              {selectedType === 'short_text' && (
                <div className="space-y-2 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Expected Match Key</Label>
                  <Input name="correct_answer" defaultValue={editingItem?.correct_answer} placeholder="Exact string for validation..." className="rounded-xl h-14 bg-white border-none ring-1 ring-slate-200 font-mono text-lg" />
                </div>
              )}

              {/* MEDIA & METADATA */}
              {(selectedType === 'hotspot' || editingItem?.image_url) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900 rounded-[2.5rem] text-white">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Visual Asset URL
                    </Label>
                    <Input name="image_url" defaultValue={editingItem?.image_url} placeholder="https://..." className="rounded-xl h-12 bg-slate-800 border-none text-white focus:ring-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Code2 className="w-3 h-3" /> Spatial Metadata
                    </Label>
                    <Input name="metadata" defaultValue={editingItem?.metadata} placeholder='[{"x": 10, ...}]' className="rounded-xl h-12 bg-slate-800 border-none text-white font-mono text-[10px] focus:ring-primary/40" />
                  </div>
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

      {/* USER DIALOG */}
      <Dialog open={dialogs.user} onOpenChange={(val) => setDialogs({...dialogs, user: val})}>
        <DialogContent className="sm:max-w-[420px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-slate-100 p-10 border-b relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UsersIcon className="w-20 h-20" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900">
              {editingItem ? 'Edit Profile' : 'New Identity'}
            </DialogTitle>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSaveUser(Object.fromEntries(formData.entries()));
            setDialogs({...dialogs, user: false});
          }} className="p-10 space-y-6">
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Identity Name</Label>
              <Input name="name" defaultValue={editingItem?.name} required className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Communication Email</Label>
              <Input name="email" type="email" defaultValue={editingItem?.email} required disabled={!!editingItem} className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Access Secret</Label>
              <Input name="password" type="password" placeholder={editingItem ? "Leave to maintain" : "Define secret..."} required={!editingItem} className="rounded-xl h-12 bg-slate-50 border-none ring-1 ring-slate-200" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Permission Level</Label>
              <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-12 px-4 rounded-xl border-none ring-1 ring-slate-200 bg-slate-50 font-black text-sm outline-none focus:ring-primary/40">
                <option value="user">Student Operator</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>
            <DialogFooter className="pt-6">
              <Button type="submit" className="rounded-full w-full h-16 font-black text-lg bg-slate-900 text-white shadow-xl">Update Identity Records</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BULK DIALOG */}
      <Dialog open={dialogs.bulk} onOpenChange={(val) => setDialogs({...dialogs, bulk: val})}>
        <DialogContent className="sm:max-w-[850px] h-[85vh] flex flex-col rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-slate-900">
          <div className="bg-slate-950 p-10 text-white flex items-center justify-between border-b border-white/5">
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">Direct Intelligence Push</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Registry: {selectedTestId}</DialogDescription>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDialogs({...dialogs, bulk: false})} className="rounded-full text-white hover:bg-white/10 font-bold">Discard</Button>
              <Button onClick={() => onSaveBulk(questionJson)} className="rounded-full bg-primary text-white font-black px-8 h-12 shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-transform">
                <Save className="w-4 h-4 mr-2" /> Commit JSON
              </Button>
            </div>
          </div>
          <div className="flex-1 p-8 bg-slate-900">
            <textarea 
              className="w-full h-full font-mono text-xs p-10 bg-slate-950 text-blue-400 border border-white/5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none scrollbar-hide" 
              value={questionJson} 
              onChange={(e) => setQuestionJson(e.target.value)} 
              spellCheck={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
