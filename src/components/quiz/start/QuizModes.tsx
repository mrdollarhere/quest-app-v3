
/**
 * QuizModes.tsx
 * 
 * Purpose: Final step before assessment start to select the protocol mode.
 * Features Live Mode injection (v18.9).
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Gamepad2, Target, Flame, Play, Radio, Users, Loader2 } from 'lucide-react';
import { QuizMode } from '@/types/quiz';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

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
  const [liveEnabled, setLiveEnabled] = useState(false);

  useEffect(() => {
    setLiveEnabled(process.env.NEXT_PUBLIC_LIVE_MODE_ENABLED === "true");
  }, []);

  const modes = [
    { id: 'training' as const, title: 'Practice', icon: Gamepad2, desc: 'Fixed sequence, take your time', color: 'bg-green-500', text: 'text-green-600' },
    { id: 'test' as const, title: 'Test', icon: Target, desc: 'Timed, shuffled, results at the end', color: 'bg-primary', text: 'text-primary' },
    { id: 'race' as const, title: 'Race', icon: Flame, desc: 'Speed & accuracy, one attempt', color: 'bg-orange-500', text: 'text-orange-600' }
  ];

  if (liveEnabled) {
    modes.push({ id: 'live' as any, title: 'Live', icon: Radio, desc: 'Join a teacher-led live session', color: 'bg-rose-500', text: 'text-rose-600' });
  }

  const current = modes.find(m => m.id === selectedMode);

  const handleCreateRoom = async () => {
    if (!user || user.role !== 'admin') {
      toast({ variant: "destructive", title: "Access Denied", description: "Only administrators can host live sessions." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/live/create-room', {
        method: 'POST',
        body: JSON.stringify({ testId, testName, hostId: user.id || user.email, hostName: user.displayName })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/live/host/${data.roomCode}`);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Room Creation Failed" });
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
              "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full transition-all min-w-[100px]",
              selectedMode === m.id ? `${m.color} text-white shadow-xl` : "text-slate-400 hover:bg-slate-200"
            )}
          >
            <m.icon className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">{m.title}</span>
          </button>
        ))}
      </div>

      {selectedMode === 'live' ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="text-center"><p className="text-lg font-bold italic text-rose-600">Teacher-hosted real-time protocol</p></div>
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
    </div>
  );
}
