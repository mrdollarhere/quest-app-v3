"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, HotspotZone } from '@/types/quiz';
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const HotspotModule: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState<number>(0.5625);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(question.image_url && question.image_url.trim() !== "" ? question.image_url : 'https://picsum.photos/seed/dntrng-placeholder/800/450');
  }, [question.image_url]);

  const zones: HotspotZone[] = useMemo(() => {
    try {
      const parsed = JSON.parse(question.metadata || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }, [question.metadata]);

  const correctZones = useMemo(() => zones.filter(z => z.isCorrect), [zones]);
  const selectedZoneIds = useMemo(() => Array.isArray(value) ? value : [], [value]);

  const handleClick = (e: React.MouseEvent) => {
    if (reviewMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const hit = zones.find(z => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height);
    if (hit) {
      let next = [...selectedZoneIds];
      next = next.includes(hit.id) ? next.filter(id => id !== hit.id) : [...next, hit.id];
      onChange(next);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full shadow-2xl rounded-none overflow-hidden bg-slate-900 border-4 border-white" style={{ paddingBottom: `${aspectRatio * 100}%`, height: 0 }}>
        <div ref={containerRef} className={cn("absolute inset-0 transition-opacity", reviewMode ? "cursor-default" : "cursor-crosshair")} onClick={handleClick}>
          {imgSrc && <img src={imgSrc} alt="Spatial" onLoad={(e) => setAspectRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)} className="absolute inset-0 w-full h-full object-contain select-none opacity-90" draggable={false} />}
          <div className="absolute inset-0 pointer-events-none">
            {zones.map((z) => {
              const isSelected = selectedZoneIds.includes(z.id);
              if (!isSelected && !reviewMode) return null;
              const isCorrect = z.isCorrect;
              
              let borderColor = "border-primary";
              let bgColor = "bg-primary/40";
              let showLabel = false;

              if (reviewMode) {
                if (isSelected && isCorrect) { borderColor = "border-emerald-500 border-[4px]"; bgColor = "bg-emerald-500/20"; showLabel = true; }
                else if (isSelected && !isCorrect) { borderColor = "border-rose-500 border-[4px]"; bgColor = "bg-rose-500/30"; showLabel = true; }
                else if (!isSelected && isCorrect) { borderColor = "border-emerald-500 border-dashed border-[3px]"; bgColor = "bg-transparent"; showLabel = true; }
                else return null;
              }

              return (
                <div key={z.id} className={cn("absolute transition-all rounded-none", borderColor, bgColor)} style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.width}%`, height: `${z.height}%` }}>
                  {showLabel && (
                    <div className={cn(
                      "absolute -top-6 left-0 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase whitespace-nowrap shadow-xl",
                      isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    )}>
                      {z.label} {isSelected && !isCorrect ? "(WRONG)" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {reviewMode && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">
            Correct Registry Targets: <span className="font-bold lowercase tracking-normal">{correctZones.map(z => z.label).join(", ")}</span>
          </p>
        </div>
      )}
    </div>
  );
};
