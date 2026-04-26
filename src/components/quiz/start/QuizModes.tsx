
/**
 * QuizModes.tsx
 * 
 * Purpose: Final step before assessment start to select the protocol mode.
 * Features Live Mode injection (v18.9) with configuration awareness and robust parameter passing.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Gamepad2, Target, Flame, Play, Radio, Users, Loader2, Info, ExternalLink } from 'lucide-react';
import { QuizMode } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface QuizModesProps {
  selectedMode: QuizMode | 'live';
  setSelectedMode: (mode: any) => void;
  onStart: (mode: QuizMode) => void;
  testId?: string;
  testName?: string;
}

export function QuizModes({ selectedMode, setSelectedMode, onStart, testId, testName }: QuizModesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  // AVAILABILITY PROTOCOL: Check if Pusher is configured client-side
  const liveAvailable = !!process.env.NEXT_PUBLIC_PUSHER_KEY;

  const modes = [
    { id: 'training' as const, title: 'Practice', icon: Gamepad2, desc: 'Fixed sequence, take your time', color: 'bg-green-500', text: 'text-green-600' },
    { id: 'test' as const, title: 'Test', icon: Target, desc: 'Timed, shuffled, results at the end', color: 'bg-primary', text: 'text-primary' },
    { id: 'race' as const, title: 'Race', icon: Flame, desc: 'Speed & accuracy, one attempt', color: 'bg-orange-500', text: 'text-orange-600' }
  ];

  modes.push({ 
    id: 'live' as any, 
    title: 'Live', 
    icon: Radio, 
    desc: 'Join a teacher-led live session', 
    color: 'bg-rose-500', 
    text: 'text-rose-600' 
  });

  const current = modes.find(m => m.id === selectedMode);

  const handleCreateRoom = async () => {
    if (!liveAvailable) {
      setShowSetupModal(true);
      return;
    }

    if (!user || user.role !== 'admin') {
      toast({ variant: "destructive", title: "Access Denied", description: "Only administrators can host live sessions." });
      return;
    }

    // REGISTRY KEY AUDIT: Ensure all required parameters are available
    const hostId = user.id || user.email;
    const hostName = user.displayName || user.email.split('@')[0];

    if (!testId || !testName) {
      toast({ 
        variant: "destructive", 
        title: "Module Error", 
        description: "Assessment context is missing. Please restart the mission." 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/live/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, testName, hostId, hostName })
      });
      
      const data = await res.json();

      if (res.status === 503) {
        setShowSetupModal(true);
      } else if (res.ok) {
        router.push(`/live/host/${data.roomCode}`);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Room Creation Failed", 
          description: data.error === 'Missing parameters' 
            ? `Required fields missing: ${data.missing.join(', ')}` 
            : (data.error || "Registry rejected request.") 
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "The live room registry could not be reached." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-100/50 p-2 rounded-full flex flex-wrap items-center justify-between border gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full transition-all min-w-[100px] relative",
              selectedMode === m.id ? `${m.color} text-white shadow-xl` : "text-slate-400 hover:bg-slate-200"
            )}
          >
            <m.icon className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">{m.title}</span>
            {m.id === 'live' && !liveAvailable && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedMode === 'live' ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="text-center">
            <p className="text-lg font-bold italic text-rose-600">Teacher-hosted real-time protocol</p>
            {!liveAvailable && <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1">Infrastructure Setup Required</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={handleCreateRoom}
              disabled={loading}
              className="h-20 rounded-3xl bg-slate-900 text-white font-black flex flex-col gap-1 border-none shadow-xl transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}
              <span className="text-xs uppercase tracking-widest">Host Session</span>
            </Button>
            <Button 
              onClick={() => router.push('/join')}
              className="h-20 rounded-3xl bg-rose-500 text-white font-black flex flex-col gap-1 border-none shadow-xl transition-all hover:scale-[1.02]"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest">Join Session</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center min-h-[30px]"><p className={cn("text-lg font-bold italic", current?.text)}>{current?.desc}</p></div>
          <Button onClick={() => onStart(selectedMode as QuizMode)} className={cn("w-full h-20 rounded-full font-black text-2xl text-white uppercase tracking-tighter shadow-2xl transition-all hover:scale-[1.02]", current?.color)}>
            Start Mission <Play className="w-6 h-6 ml-3 fill-current" />
          </Button>
        </>
      )}

      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-10 border-none shadow-2xl bg-white">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-2">
              <Info className="w-8 h-8 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Live Mode Setup</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 leading-relaxed">
              Real-time sessions require a **Pusher** websocket configuration. 
              To enable this feature, you must add your credentials to the platform environment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Required Registry Keys</p>
              <ul className="text-xs space-y-2 font-mono text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> PUSHER_APP_ID</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> PUSHER_SECRET</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> NEXT_PUBLIC_PUSHER_KEY</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> NEXT_PUBLIC_PUSHER_CLUSTER</li>
              </ul>
            </div>
            <a href="https://pusher.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs font-black text-primary uppercase hover:underline">
              Get free keys at Pusher.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSetupModal(false)} className="w-full h-14 rounded-full bg-slate-900 font-black uppercase text-xs tracking-widest border-none">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
