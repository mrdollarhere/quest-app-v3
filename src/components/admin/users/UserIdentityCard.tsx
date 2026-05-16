/**
 * UserIdentityCard.tsx
 * 
 * Purpose: Renders the primary identity card for a student in the admin detail view.
 * Extracted: v19.0 (CEP)
 */

import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Target } from 'lucide-react';

interface UserIdentityCardProps {
  user: any;
}

export function UserIdentityCard({ user }: UserIdentityCardProps) {
  return (
    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
      <div className="h-32 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute top-0 right-0 p-6 opacity-5"><Target className="w-24 h-24 text-white" /></div>
      </div>
      <div className="px-8 pb-10 -mt-16 relative z-10 text-center">
        <div className="w-32 h-32 rounded-full border-8 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 mx-auto mb-6 flex items-center justify-center font-black text-4xl text-primary shadow-xl overflow-hidden">
          {user.image_url ? (
            <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">{user.name}</h2>
        <Badge className="rounded-full bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none">
          {user.role} Operator
        </Badge>

        <div className="mt-10 space-y-4 text-left">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Shield} label="Access Profile" value={user.role === 'admin' ? 'Root Admin' : 'Standard Student'} />
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Icon className="w-4 h-4 text-slate-400" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{value}</p>
      </div>
    </div>
  );
}
