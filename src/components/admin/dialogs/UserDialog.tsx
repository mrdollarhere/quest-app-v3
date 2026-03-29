"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, UserPlus, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
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
  
  // Controlled form state for single entry
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Reset/Populate state when dialog opens or editingItem changes
  useEffect(() => {
    if (open) {
      if (editingItem) {
        setFormData({
          name: editingItem.name || '',
          email: editingItem.email || '',
          password: editingItem.password || '',
          role: editingItem.role || 'user'
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });
      }
    }
  }, [open, editingItem]);

  // Determine if the save button should be disabled (Change-Aware Guard)
  const isSaveDisabled = editingItem ? (
    // In edit mode: disable if NO fields have changed from the registry record
    formData.name === (editingItem.name || '') &&
    formData.email === (editingItem.email || '') &&
    formData.password === (editingItem.password || '') &&
    formData.role === (editingItem.role || 'user')
  ) : (
    // In add mode: disable if required identity fields are empty
    !formData.name.trim() || !formData.email.trim()
  );

  const handleSingleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const payload: any = { ...formData };
    
    // Protocol Transparency: We send the password if it's visible/edited.
    if (editingItem && !formData.password.trim()) {
      delete payload.password;
    }
    
    onSave(payload);
    onOpenChange(false);
  };

  const handleBatchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const batchFormData = new FormData(e.currentTarget);
    const data = Object.fromEntries(batchFormData.entries());
    
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
        <DialogHeader className="p-10 pb-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {editingItem ? 'Edit User' : 'Add User'}
            </DialogTitle>
          </div>
        </DialogHeader>

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
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    name="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                    placeholder="Enter full name" 
                    className="h-14 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                    readOnly={!!editingItem} 
                    placeholder="Enter email address" 
                    className={cn(
                      "h-14 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40",
                      !!editingItem && "opacity-60 cursor-not-allowed"
                    )} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password" 
                    className="h-14 pl-11 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold focus:ring-primary/40" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Role</Label>
                <select 
                  name="role" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full h-14 px-4 rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm outline-none focus:ring-primary/40 cursor-pointer"
                >
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <DialogFooter className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isSaveDisabled}
                  className="rounded-full w-full h-16 font-black text-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transition-all hover:scale-[1.02] border-none"
                >
                  {editingItem ? 'Save Changes' : 'Add User'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="batch">
            <form onSubmit={handleBatchSubmit} className="p-10 space-y-6">
              <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border-2 border-dashed border-primary/20 mb-4 text-center">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-relaxed">
                  Bulk Provisioning Registry. Use <code className="font-bold">{"{{n}}"}</code> for sequence.
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
                <Input name="emailPattern" required placeholder="student{{n}}@dntrng.com" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Initial Password</Label>
                <div className="relative">
                  <Input 
                    name="password" 
                    type={showBatchPassword ? "text" : "password"} 
                    required 
                    defaultValue="admin123" 
                    className="h-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowBatchPassword(!showBatchPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showBatchPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button type="submit" className="rounded-full w-full h-16 font-black text-lg bg-primary text-white shadow-xl hover:scale-[1.02] transition-all border-none">
                  Initialize Batch Provisioning
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
