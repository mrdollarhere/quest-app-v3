/**
 * QuestionDialog.tsx
 * 
 * Purpose: Primary orchestration modal for editing assessment questions.
 * Key components: QuestionTypeSidebar, QuestionPreviewPane, HotspotMapperDialog.
 * Design: Visual asset previews are strictly rectangular (rounded-none).
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Code2, Eye, EyeOff, X, AlertCircle, Loader2, Target } from "lucide-react";
import { QuestionType, Question } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { getRegistryValue, parseRegistryArray } from '@/lib/quiz-utils';
import { ChoiceFields } from './question-forms/ChoiceFields';
import { TextField } from './question-forms/TextField';
import { BooleanFields } from './question-forms/BooleanFields';
import { MatrixFields } from './question-forms/MatrixFields';
import { MatchingFields } from './question-forms/MatchingFields';
import { HotspotMapperDialog } from './HotspotMapperDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SafeImage } from '@/components/SafeImage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Sub-components per Protocol v18.9
import { QuestionTypeSidebar } from './QuestionTypeSidebar';
import { QuestionPreviewPane } from './QuestionPreviewPane';

export function QuestionDialog(props: any) {
  return (
    <ErrorBoundary><QuestionDialogContent {...props} /></ErrorBoundary>
  );
}

function QuestionDialogContent({ open, onOpenChange, editingItem, selectedTestId, onSave, loading }: any) {
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

      setSelectedType(qType); setQuestionText(qTextVal); setIsRequired(isReqVal); setOptionsList(opts);
      setCorrectAnswers(ans); setMatrixRows(rows); setMatchingPairs(pairs); setImageUrl(img); setMetadata(meta);
      setInitialSnapshot(JSON.stringify({ type: qType, text: qTextVal, required: isReqVal, options: opts, correct: ans, rows: rows, pairs: pairs, image: img, metadata: meta }));
    }
  }, [open, editingItem]);

  const isDirty = initialSnapshot !== null && initialSnapshot !== JSON.stringify({ type: selectedType, text: questionText, required: isRequired, options: optionsList, correct: correctAnswers, rows: matrixRows, pairs: matchingPairs, image: imageUrl, metadata: metadata });

  const handleDialogChange = (newOpen: boolean) => {
    if (loading) return;
    if (!newOpen && isDirty) setShowDiscardWarning(true);
    else onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    let finalOptions = optionsList.filter(o => o.trim() !== "");
    let finalCorrect = correctAnswers.filter(a => a.trim() !== "");
    let finalOrder = matrixRows.filter(r => r.trim() !== "");
    if (selectedType === 'ordering') { finalCorrect = finalOptions; finalOrder = finalOptions; }
    else if (selectedType === 'matching') { finalOrder = matchingPairs.map(p => `${p.left}|${p.right}`); finalCorrect = finalOrder; finalOptions = []; }
    onSave({ question_text: questionText, id: editingItem?.id || `q_${Date.now()}`, options: JSON.stringify(finalOptions), correct_answer: JSON.stringify(finalCorrect), order_group: JSON.stringify(finalOrder), image_url: imageUrl, metadata: metadata, question_type: selectedType }, isRequired);
  };

  const previewQuestion: Question = { id: editingItem?.id || 'preview', question_text: questionText, question_type: selectedType, image_url: imageUrl, metadata: metadata, required: isRequired, options: JSON.stringify(optionsList), correct_answer: JSON.stringify(selectedType === 'ordering' ? optionsList : selectedType === 'matching' ? matchingPairs.map(p => `${p.left}|${p.right}`) : correctAnswers), order_group: JSON.stringify(selectedType === 'ordering' ? optionsList : selectedType === 'matching' ? matchingPairs.map(p => `${p.left}|${p.right}`) : matrixRows) };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className={cn("h-[90vh] rounded-[3rem] overflow-hidden p-0 border-none shadow-2xl bg-white flex flex-row transition-all duration-500", showPreview ? "sm:max-w-[95vw]" : "sm:max-w-[85vw]", loading && "cursor-wait")}>
          {loading && <div className="absolute inset-0 z-[100] bg-white/10 backdrop-blur-[0.5px]" />}
          <QuestionTypeSidebar selectedType={selectedType} setSelectedType={setSelectedType} loading={loading} />
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4"><div className="bg-primary/10 p-2 rounded-xl"><Code2 className="w-5 h-5 text-primary" /></div><DialogTitle className="text-2xl font-black uppercase tracking-tight">Question Editor</DialogTitle></div>
              <Button type="button" variant="outline" disabled={loading} onClick={() => setShowPreview(!showPreview)} className={cn("rounded-full font-black text-[10px] uppercase tracking-widest gap-2 border-2 h-11 px-6", showPreview ? "bg-primary/5 text-primary border-primary/20" : "text-slate-400")}>
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showPreview ? "Hide Preview" : "Live Preview"}
              </Button>
            </div>
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
              <div className={cn("flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar", showPreview && "lg:border-r border-slate-100")}>
                <div className="space-y-3"><Label className="text-[10px] font-black uppercase text-slate-400">Question Prompt</Label><Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} disabled={loading} required placeholder="Enter the assessment prompt..." className="rounded-2xl min-h-[100px] text-xl bg-slate-50 border-none ring-1 ring-slate-100" /></div>
                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6">
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400">Visual Asset (URL)</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={loading} placeholder="https://..." className="rounded-xl h-12 bg-white ring-1 ring-slate-200 border-none" /></div>
                  {imageUrl && <div className="relative inline-block group"><div className="overflow-hidden rounded-none border-2 shadow-sm bg-white"><SafeImage src={imageUrl} alt="Preview" className="max-h-[120px] w-auto object-contain" /></div></div>}
                  {selectedType === 'hotspot' && <Button type="button" onClick={() => setMapperOpen(true)} disabled={loading} className="w-full h-12 bg-slate-900 text-white font-black uppercase text-[10px] rounded-xl"><Target className="w-4 h-4 mr-2" /> Open Zone Mapper</Button>}
                </div>
                <div className="space-y-6">
                  {['single_choice', 'multiple_choice', 'dropdown', 'ordering'].includes(selectedType) && <ChoiceFields type={selectedType} options={optionsList} setOptions={setOptionsList} correct={correctAnswers} setCorrect={setCorrectAnswers} disabled={loading} />}
                  {selectedType === 'short_text' && <TextField value={correctAnswers[0] || ""} onChange={(v) => setCorrectAnswers([v])} disabled={loading} />}
                  {['true_false', 'multiple_true_false'].includes(selectedType) && <BooleanFields type={selectedType} rows={matrixRows} setRows={setMatrixRows} correct={correctAnswers} setCorrect={setCorrectAnswers} disabled={loading} />}
                  {selectedType === 'matrix_choice' && <MatrixFields rows={matrixRows} setRows={setMatrixRows} cols={optionsList} setCols={setOptionsList} correct={correctAnswers} setCorrect={setCorrectAnswers} disabled={loading} />}
                  {selectedType === 'matching' && <MatchingFields pairs={matchingPairs} setPairs={setMatchingPairs} disabled={loading} />}
                </div>
              </div>
              <QuestionPreviewPane showPreview={showPreview} previewQuestion={previewQuestion} textSize="normal" />
            </div>
            <div className="p-8 border-t flex items-center justify-between bg-white/80 shrink-0">
              <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <Checkbox id="required" checked={isRequired} disabled={loading} onCheckedChange={(checked) => setIsRequired(!!checked)} />
                <Label htmlFor="required" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Mandatory Question</Label>
              </div>
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" disabled={loading} onClick={() => onOpenChange(false)} className="rounded-full font-bold text-slate-400 h-16 px-8">Discard</Button>
                <Button type="submit" disabled={loading || !questionText.trim()} className="rounded-full min-w-[240px] h-16 font-black text-lg bg-primary shadow-2xl shadow-primary/20 transition-all border-none">
                  {loading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving Registry...</> : <><Save className="w-5 h-5 mr-3" /> Commit Registry</>}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
        <HotspotMapperDialog open={mapperOpen} onOpenChange={setMapperOpen} imageUrl={imageUrl} initialData={metadata} onSave={setMetadata} />
      </Dialog>
      <AlertDialog open={showDiscardWarning} onOpenChange={setShowDiscardWarning}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <AlertDialogHeader><AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Unsaved Changes</AlertDialogTitle><AlertDialogDescription className="text-slate-500 font-medium">Are you sure you want to exit without committing to the registry?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3"><AlertDialogCancel asChild><Button variant="ghost" className="rounded-full font-bold uppercase text-[10px] tracking-widest flex-1">Keep Editing</Button></AlertDialogCancel><AlertDialogAction asChild><Button onClick={() => { setInitialSnapshot(null); onOpenChange(false); }} className="rounded-full bg-destructive text-white font-black uppercase text-[10px] tracking-widest px-8 flex-1 border-none">Discard Changes</Button></AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
