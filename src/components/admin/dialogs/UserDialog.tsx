"use client";

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, UserPlus, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  onSave: (data: any) => void;
  onSaveBatch?: (data: any[]) => void;
}

export function UserDialog({ open, onOpenChange, editingItem, onSave, onSaveBatch }: UserDialogProps) {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [showPassword, setShowPassword] = useState(false);
  const [showBatchPassword, setShowBatchPassword] = useState(false);

  const handleSingleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Safety: Omit password if editing to prevent accidentally clearing the existing password in the sheet
    // if the user left the field empty.
    if (editingItem && !data.password) {
      delete data.password;
    }
    
    onSave(data);
    onOpenChange(false);
  };

  const handleBatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const prefix = String(data.namePrefix || "");
    const emailPattern = String(data.emailPattern || "");
    const start = parseInt(String(data.rangeStart || "1"));
    const end = parseInt(String(data.rangeEnd || "10"));
    const password = String(data.password || "admin123");
    const role = String(data.role || "user");

    const batch: any[] = [];
    for (let i = start; i <= end; i++) {
      const numStr = i.toString().padStart(2, '0');
      batch.push({
        id: `batch_${Date.now()}_${i}`,
        name: prefix + numStr,
        email: emailPattern.replace('{{n}}', numStr).replace('[n]', numStr),
        password: password,
        role: role
      });
    }

    if (onSaveBatch) {
      onSaveBatch(batch);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UsersIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-xl rotate-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                {editingItem ? 'Edit Profile' : 'Add Students'}
              </DialogTitle>
              <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">
                Student Access List
              </DialogDescription>
            </div>
          </div>
        </div>

        <Tabs defaultValue="single" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
          {!editingItem && (
            <div className="px-10 pt-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-12">
                <TabsTrigger value="single" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  Add One
                </TabsTrigger>
                <TabsTrigger value="batch" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  Add Many
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="single">
            <form onSubmit={handleSingleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                <div className="relative">
                  <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input name="name" defaultValue={editingItem?.name} required placeholder="Student Name" className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    name="email" 
                    type="email" 
                    defaultValue={editingItem?.email} 
                    required 
                    readOnly={!!editingItem} 
                    placeholder="student@email.com" 
                    className={cn(
                      "h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40",
                      !!editingItem && "opacity-60 cursor-not-allowed"
                    )} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Password Registry</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    defaultValue={editingItem?.password}
                    placeholder={editingItem ? "Leave blank to keep current" : "Set password"} 
                    required={!editingItem} 
                    className="h-12 pl-11 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Account Role</Label>
                <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full h-12 px-4 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm outline-none focus:ring-primary/40 cursor-pointer">
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <DialogFooter className="pt-6">
                <Button type="submit" className="rounded-full w-full h-16 font-black text-lg bg-slate-900 dark:bg-primary text-white">
                  Save Student
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="batch">
            <form onSubmit={handleBatchSubmit} className="p-10 space-y-6">
              <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border-2 border-dashed border-primary/20 mb-4">
                <p className="text-[10px] font-medium text-primary/60 leading-relaxed">
                  Generate multiple accounts at once. Use <code className="font-bold">{"{{n}}"}</code> in the email field for the number.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Name Prefix</Label>
                  <Input name="namePrefix" placeholder="Student " className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Number Range</Label>
                  <div className="flex items-center gap-2">
                    <Input name="rangeStart" type="number" defaultValue="1" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-center" />
                    <span className="text-slate-300 font-black">to</span>
                    <Input name="rangeEnd" type="number" defaultValue="10" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-center" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email Pattern</Label>
                <Input name="emailPattern" required placeholder="student{{n}}@school.com" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Shared Password</Label>
                <div className="relative">
                  <Input 
                    name="password" 
                    type={showBatchPassword ? "text" : "password"} 
                    required 
                    defaultValue="admin123" 
                    className="h-12 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowBatchPassword(!showBatchPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showBatchPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button type="submit" className="rounded-full w-full h-16 font-black text-lg bg-primary text-white">
                  Add All Students
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
