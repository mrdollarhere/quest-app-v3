"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  Layers, 
  ListOrdered, 
  Type, 
  Star, 
  Link2,
  Code2,
  Target,
  Grid,
  Eye,
  EyeOff,
  Sparkles,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { QuestionType, Question } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { getRegistryValue, parseRegistryArray } from '@/lib/quiz-utils';
import { ChoiceFields } from './question-forms/ChoiceFields';
import { TextField } from './question-forms/TextField';
import { BooleanFields } from './question-forms/BooleanFields';
import { MatrixFields } from './question-forms/MatrixFields';
import { MatchingFields } from './question-forms/MatchingFields';
import { HotspotMapperDialog } from './HotspotMapperDialog';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  selectedTestId: string;
  onSave: (data: any, isRequired: boolean) => void;
  loading?: boolean;
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

export function QuestionDialog({ open, onOpenChange, editingItem, selectedTestId, onSave, loading }: QuestionDialogProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>('single_choice');
  const [questionText, setQuestionText] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<{left: string, right: string}[]>([]);
  const [matrixRows, setMatrixRows] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [metadata, setMetadata] = useState('');
  const [mapperOpen, setMapperOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [debouncedUrl, setDebouncedUrl] = useState('');
  const [isValidImage, setIsValidImage] = useState<boolean | null>(null);

  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  useEffect(() => {
    if (open) {
      const qType = (getRegistryValue(editingItem, ['question_type']) || 'single_choice') as QuestionType;
      const qTextVal = getRegistryValue(editingItem, ['question_text']) || '';
      const isReqVal = String(getRegistryValue(editingItem, ['required'])).toUpperCase() === "TRUE";
      const opts = parseRegistryArray(getRegistryValue(editingItem, ['options']));
      const ans = parseRegistryArray(getRegistryValue(editingItem, ['correct_answer']));
      const rows = parseRegistryArray(getRegistryValue(editingItem, ['order_group']));
      const pairs = rows.map(p => { const [l, r] = p.split('|'); return { left: (l || "").trim(), right: (r || "").trim() }; });
      const img = getRegistryValue(editingItem, ['image_url']) || '';
      const meta = getRegistryValue(editingItem, ['metadata']) || '';

      setSelectedType(qType);
      setQuestionText(qTextVal);
      setIsRequired(isReqVal);
      setOptionsList(opts);
      setCorrectAnswers(ans);
      setMatrixRows(rows);
      setMatchingPairs(pairs);
      setImageUrl(img);
      setDebouncedUrl(img);
      setIsValidImage(null);
      setMetadata(meta);

      setInitialSnapshot(JSON.stringify({
        type: qType,
        text: qTextVal,
        required: isReqVal,
        options: opts,
        correct: ans,
        rows: rows,
        pairs: pairs,
        image: img,
        metadata: meta
      }));
    } else {
      setShowDiscardWarning(false);
      setShowPreview(false);
    }
  }, [open, editingItem]);

  useEffect(() => {
    setIsValidImage(null);
    const timer = setTimeout(() => {
      setDebouncedUrl(imageUrl);
    }, 500);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  const currentSnapshot = JSON.stringify({
    type: selectedType,
    text: questionText,
    required: isRequired,
    options: optionsList,
    correct: correctAnswers,
    rows: matrixRows,
    pairs: matchingPairs,
    image: imageUrl,
    metadata: metadata
  });

  const isDirty = initialSnapshot !== null && initialSnapshot !== currentSnapshot;

  const handleDialogChange = (newOpen: boolean) => {
    if (loading) return;
    if (!newOpen && isDirty) {
      setShowDiscardWarning(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    const cleanOptions = optionsList.filter(o => o && o.trim() !== "");
    const cleanCorrect = correctAnswers.filter(a => a && a.trim() !== "");
    const cleanRows = matrixRows.filter(r => r && r.trim() !== "");

    let finalOptions = cleanOptions;
    let finalCorrect = cleanCorrect;
    let finalOrder = cleanRows;

    if (selectedType === 'ordering') {
      finalOptions = cleanOptions;
      finalCorrect = cleanOptions;
      finalOrder = cleanOptions;
    } else if (selectedType === 'matching') {
      const pairs = matchingPairs
        .filter(p => p.left.trim() !== "" && p.right.trim() !== "")
        .map(p => `${p.left.trim()}|${p.right.trim()}`);
      finalOrder = pairs;
      finalCorrect = pairs;
      finalOptions = []; 
    }
    
    const payload = {
      question_text: questionText,
      id: editingItem?.id || `q_${Date.now()}`,
      options: finalOptions.length > 0 ? JSON.stringify(finalOptions) : "",
      correct_answer: finalCorrect.length > 0 ? JSON.stringify(finalCorrect) : "",
      order_group: finalOrder.length > 0 ? JSON.stringify(finalOrder) : "",
      image_url: imageUrl,
      metadata: metadata,
      question_type: selectedType
    };

    onSave(payload, isRequired);
  };

  const previewQuestion: Question = {
    id: editingItem?.id || 'preview',
    question_text: questionText,
    question_type: selectedType,
    image_url: imageUrl,
    metadata: metadata,
    required: isRequired,
    options: JSON.stringify(optionsList),
    correct_answer: JSON.stringify(
      selectedType === 'ordering' ? optionsList : 
      selectedType === 'matching' ? matchingPairs.map(p => `${p.left}|${p.right}`) : 
      correctAnswers
    ),
    order_group: JSON.stringify(
      selectedType === 'ordering' ? optionsList :
      selectedType === 'matching' ? matchingPairs.map(p => `${p.left}|${p.right}`) : 
      matrixRows
    )
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className={cn(
          "h-[90vh] rounded-[3rem] overflow-hidden p-0 border-none shadow-2xl bg-white flex flex-row transition-all duration-500",
          showPreview ? "sm:max-w-[95vw]" : "sm:max-w-[85vw]",
          loading ? "cursor-wait" : ""
        )}>
          {/* Loading Lock Overlay */}
          {loading && (
            <div className="absolute inset-0 z-[100] bg-white/10 backdrop-blur-[0.5px] cursor-wait" />
          )}

          <div className="w-[280px] bg-slate-50 border-r p-4 overflow-y-auto hidden lg:block">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 px-4 tracking-widest">Input Protocol</p>
            {QUESTION_TYPES.map((type) => (
              <button 
                key={type.value} 
                type="button"
                disabled={loading}
                onClick={() => setSelectedType(type.value as QuestionType)} 
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-1", 
                  selectedType === type.value ? "bg-primary text-white shadow-xl" : "hover:bg-white text-slate-500",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <type.icon className="w-5 h-5" />
                <span className="text-xs font-black uppercase">{type.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div><DialogTitle className="text-2xl font-black uppercase tracking-tight">Step Editor</DialogTitle></div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={loading}
                  onClick={() => setShowPreview(!showPreview)}
                  className={cn(
                    "rounded-full font-black text-[10px] uppercase tracking-widest gap-2 border-2 h-11 px-6",
                    showPreview ? "bg-primary/5 text-primary border-primary/20" : "text-slate-400"
                  )}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? "Hide Preview" : "Live Preview"}
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
              {loading && <div className="absolute inset-0 z-[60] bg-white/20 cursor-wait" />}
              
              <div className={cn(
                "flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar transition-all duration-500",
                showPreview ? "lg:border-r border-slate-100" : ""
              )}>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Question Prompt</Label>
                  <Textarea 
                    name="question_text" 
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    disabled={loading}
                    required 
                    placeholder="Enter the assessment prompt..."
                    className="rounded-2xl min-h-[100px] text-xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-primary/40 transition-all disabled:opacity-50" 
                  />
                </div>

                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Visual Asset (URL)</Label>
                    <Input 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      disabled={loading}
                      placeholder="https://..." 
                      className="rounded-xl h-12 bg-white ring-1 ring-slate-200 border-none disabled:opacity-50" 
                    />
                  </div>

                  {imageUrl && (
                    <div className="space-y-3">
                      {isValidImage === false && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-1 duration-300">
                          <AlertCircle className="w-3 h-3" />
                          <p className="text-[10px] font-bold uppercase tracking-tight">Image could not be loaded — check the URL</p>
                        </div>
                      )}
                      
                      <div className="relative inline-block group">
                        <div className={cn(
                          "overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-500 bg-white",
                          isValidImage === true ? "border-slate-200 opacity-100 scale-100" : "border-transparent opacity-0 h-0 scale-95"
                        )}>
                          <img 
                            src={debouncedUrl} 
                            onLoad={() => setIsValidImage(true)}
                            onError={() => setIsValidImage(false)}
                            alt="Asset Preview"
                            className="max-h-[120px] w-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                        </div>
                        
                        {isValidImage === true && !loading && (
                          <Button 
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setImageUrl('')}
                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedType === 'hotspot' && (
                    <Button 
                      type="button" 
                      onClick={() => setMapperOpen(true)} 
                      disabled={loading}
                      className="w-full h-12 bg-slate-900 text-white font-black uppercase text-[10px] rounded-xl hover:scale-[1.01] transition-transform"
                    >
                      <Target className="w-4 h-4 mr-2" /> Open Zone Registry Mapper
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {['single_choice', 'multiple_choice', 'dropdown', 'ordering'].includes(selectedType) && (
                    <ChoiceFields 
                      type={selectedType} 
                      options={optionsList} 
                      setOptions={setOptionsList} 
                      correct={correctAnswers} 
                      setCorrect={setCorrectAnswers} 
                      disabled={loading}
                    />
                  )}
                  {selectedType === 'short_text' && (
                    <TextField 
                      value={correctAnswers[0] || ""} 
                      onChange={(v) => setCorrectAnswers([v])} 
                      disabled={loading}
                    />
                  )}
                  {['true_false', 'multiple_true_false'].includes(selectedType) && (
                    <BooleanFields 
                      type={selectedType} 
                      rows={matrixRows} 
                      setRows={setMatrixRows} 
                      correct={correctAnswers} 
                      setCorrect={setCorrectAnswers} 
                      disabled={loading}
                    />
                  )}
                  {selectedType === 'matrix_choice' && (
                    <MatrixFields 
                      rows={matrixRows} 
                      setRows={setMatrixRows} 
                      cols={optionsList} 
                      setCols={setOptionsList} 
                      correct={correctAnswers} 
                      setCorrect={setCorrectAnswers} 
                      disabled={loading}
                    />
                  )}
                  {selectedType === 'matching' && (
                    <MatchingFields 
                      pairs={matchingPairs} 
                      setPairs={setMatchingPairs} 
                      disabled={loading}
                    />
                  )}
                </div>
              </div>

              {showPreview && (
                <div className="hidden lg:flex flex-1 flex-col bg-slate-50/50 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terminal Preview</span>
                    </div>
                    <div className="px-3 py-1 bg-white rounded-full border shadow-sm text-[8px] font-black text-primary uppercase">Simulation Protocol</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
                      <QuestionRenderer 
                        question={previewQuestion}
                        value={null}
                        onChange={() => {}}
                        reviewMode={false}
                      />
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Simulation Mode — Data Persistence Restricted</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t flex items-center justify-between bg-white/80 shrink-0">
              <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <Checkbox 
                  id="required" 
                  checked={isRequired}
                  disabled={loading}
                  onCheckedChange={(checked) => setIsRequired(!!checked)}
                />
                <Label htmlFor="required" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">Mandatory Step</Label>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={loading}
                  onClick={() => onOpenChange(false)}
                  className="rounded-full font-bold text-slate-400 h-16 px-8"
                >
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !questionText.trim()}
                  className="rounded-full min-w-[240px] h-16 font-black text-lg bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all border-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Saving Registry...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      Commit Registry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
        <HotspotMapperDialog open={mapperOpen} onOpenChange={setMapperOpen} imageUrl={imageUrl} initialData={metadata} onSave={setMetadata} />
      </Dialog>

      <AlertDialog open={showDiscardWarning} onOpenChange={setShowDiscardWarning}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              You have made modifications to this assessment step. Are you sure you want to exit without committing to the registry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="rounded-full font-bold uppercase text-[10px] tracking-widest flex-1">Keep Editing</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={() => {
                  setInitialSnapshot(null);
                  onOpenChange(false);
                }} 
                className="rounded-full bg-destructive text-white font-black uppercase text-[10px] tracking-widest px-8 flex-1 border-none shadow-xl shadow-destructive/20"
              >
                Discard Changes
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
