
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
import { Save } from "lucide-react";
import { Question } from '@/types/quiz';

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
  const [questionJson, setQuestionJson] = useState("");

  useEffect(() => {
    if (dialogs.bulk) {
      setQuestionJson(JSON.stringify(questions, null, 2));
    }
  }, [dialogs.bulk, questions]);

  return (
    <>
      {/* Test Dialog */}
      <Dialog open={dialogs.test} onOpenChange={(val) => setDialogs({...dialogs, test: val})}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-primary p-8 text-white">
            <DialogTitle className="text-2xl font-black">{editingItem ? 'Edit Test' : 'New Assessment'}</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">Define the core metadata for your quiz.</DialogDescription>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSaveTest(Object.fromEntries(formData.entries()));
            setDialogs({...dialogs, test: false});
          }} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Test ID</Label><Input name="id" defaultValue={editingItem?.id} required disabled={!!editingItem} className="rounded-xl h-11" /></div>
              <div className="space-y-2"><Label className="font-bold">Category</Label><Input name="category" defaultValue={editingItem?.category} className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Title</Label><Input name="title" defaultValue={editingItem?.title} required className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Description</Label><Textarea name="description" defaultValue={editingItem?.description} className="rounded-xl min-h-[80px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Difficulty</Label><Input name="difficulty" defaultValue={editingItem?.difficulty} className="rounded-xl h-11" /></div>
              <div className="space-y-2"><Label className="font-bold">Duration</Label><Input name="duration" defaultValue={editingItem?.duration} placeholder="e.g. 15m" className="rounded-xl h-11" /></div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Image URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} className="rounded-xl h-11" /></div>
            <DialogFooter className="pt-4"><Button type="submit" className="rounded-full w-full h-12 font-black text-lg shadow-xl">Save Assessment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={dialogs.question} onOpenChange={(val) => setDialogs({...dialogs, question: val})}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl bg-white">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black">{editingItem ? 'Edit Question' : 'New Question'}</DialogTitle>
            <DialogDescription className="text-white/60">Configuring item for: <span className="text-white font-bold">{selectedTestId}</span></DialogDescription>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSaveQuestion(Object.fromEntries(formData.entries()), formData.get('required') === 'on');
            setDialogs({...dialogs, question: false});
          }} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Type</Label>
                <select name="question_type" defaultValue={editingItem?.question_type || 'single_choice'} className="w-full h-11 px-3 rounded-xl border bg-slate-50 font-bold text-sm outline-none">
                  <option value="single_choice">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_text">Short Text</option>
                  <option value="ordering">Ordering</option>
                  <option value="matching">Matching</option>
                  <option value="hotspot">Hotspot</option>
                  <option value="rating">Rating</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Question ID</Label>
                <Input name="id" defaultValue={editingItem?.id} placeholder="Auto-generated if empty" className="rounded-xl h-11" disabled={!!editingItem} />
              </div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Prompt Text</Label><Textarea name="question_text" defaultValue={editingItem?.question_text} required className="rounded-xl min-h-[100px]" /></div>
            <div className="space-y-2"><Label className="font-bold">Choices (Comma separated)</Label><Input name="options" defaultValue={editingItem?.options} placeholder="Choice A, Choice B..." className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Correct Key</Label><Input name="correct_answer" defaultValue={editingItem?.correct_answer} className="rounded-xl h-11 font-mono text-xs" /></div>
            <div className="space-y-2"><Label className="font-bold">Reference Media URL</Label><Input name="image_url" defaultValue={editingItem?.image_url} className="rounded-xl h-11" /></div>
            <div className="flex items-center space-x-3 py-3 bg-slate-50 rounded-xl px-4 border">
               <input type="checkbox" name="required" id="q_required" className="w-5 h-5 rounded-md border-2 border-slate-300 accent-primary" defaultChecked={editingItem?.required === "TRUE" || editingItem?.required === true} />
               <Label htmlFor="q_required" className="font-black cursor-pointer">Compulsory Question</Label>
            </div>
            <DialogFooter><Button type="submit" className="rounded-full w-full h-12 font-black text-lg shadow-xl">Commit Question</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={dialogs.user} onOpenChange={(val) => setDialogs({...dialogs, user: val})}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-slate-100 p-8 border-b">
            <DialogTitle className="text-2xl font-black text-slate-900">{editingItem ? 'Edit User' : 'New Account'}</DialogTitle>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSaveUser(Object.fromEntries(formData.entries()));
            setDialogs({...dialogs, user: false});
          }} className="p-8 space-y-6">
            <div className="space-y-2"><Label className="font-bold">Full Name</Label><Input name="name" defaultValue={editingItem?.name} required className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Email Address</Label><Input name="email" type="email" defaultValue={editingItem?.email} required disabled={!!editingItem} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Access Secret</Label><Input name="password" type="password" placeholder={editingItem ? "Leave to keep current" : "Set password"} required={!editingItem} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-bold">Permission Role</Label>
              <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-11 px-3 rounded-xl border bg-slate-50 font-bold outline-none">
                <option value="user">Student / User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <DialogFooter className="pt-4"><Button type="submit" className="rounded-full w-full h-12 font-black text-lg">Update Records</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={dialogs.bulk} onOpenChange={(val) => setDialogs({...dialogs, bulk: val})}>
        <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-slate-900">
          <div className="bg-slate-950 p-8 text-white flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black">Bulk Data Sync</DialogTitle>
              <DialogDescription className="text-slate-400">Direct JSON manipulation for: {selectedTestId}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setDialogs({...dialogs, bulk: false})} className="rounded-full text-white hover:bg-white/10">Discard</Button>
              <Button onClick={() => onSaveBulk(questionJson)} className="rounded-full bg-primary text-white font-bold px-6 shadow-lg shadow-primary/30"><Save className="w-4 h-4 mr-2" /> Push Changes</Button>
            </div>
          </div>
          <div className="flex-1 p-6 bg-slate-900">
            <textarea 
              className="w-full h-full font-mono text-xs p-8 bg-slate-950 text-green-400 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none" 
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
