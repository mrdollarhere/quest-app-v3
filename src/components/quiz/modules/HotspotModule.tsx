"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, HotspotZone } from '@/types/quiz';
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setAspectRatio(img.naturalHeight / img.naturalWidth);
  };

  const zones: HotspotZone[] = useMemo(() => {
    try {
      const parsed = JSON.parse(question.metadata || "[]");
      return Array.isArray(parsed) ? parsed.map((z: any) => {
        // Migration Protocol: radius -> rect
        if ('radius' in z && !('width' in z)) {
          const r = z.radius;
          return {
            ...z,
            x: z.x - r,
            y: z.y - r,
            width: r * 2,
            height: r * 2
          };
        }
        return z;
      }) : [];
    } catch (e) {
      return [];
    }
  }, [question.metadata]);

  const maxSelections = useMemo(() => zones.filter(z => z.isCorrect).length || 1, [zones]);
  const selectedZoneIds = useMemo(() => Array.isArray(value) ? value : [], [value]);

  const handleClick = (e: React.MouseEvent) => {
    if (reviewMode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find if click was inside any zone
    const hitZone = zones.find(z => 
      clickX >= z.x && clickX <= z.x + z.width &&
      clickY >= z.y && clickY <= z.y + z.height
    );

    if (hitZone) {
      let nextSelection = [...selectedZoneIds];
      if (nextSelection.includes(hitZone.id)) {
        // Deselect
        nextSelection = nextSelection.filter(id => id !== hitZone.id);
      } else {
        // Select & Handle Auto-Swap (FIFO)
        if (nextSelection.length >= maxSelections) {
          nextSelection.shift(); // Remove oldest
        }
        nextSelection.push(hitZone.id);
      }
      onChange(nextSelection);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="relative w-full shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900"
        style={{ paddingBottom: `${aspectRatio * 100}%`, height: 0 }}
      >
        <div 
          ref={containerRef}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            reviewMode ? "cursor-default" : "cursor-crosshair"
          )}
          onClick={handleClick}
        >
          {imgSrc && (
            <img 
              src={imgSrc} 
              alt="Spatial Module" 
              onLoad={handleImageLoad}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
              draggable={false} 
            />
          )}

          {/* Interaction Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {/* User Interaction Markers (Active Phase) */}
            {!reviewMode && zones.map((z) => {
              const isSelected = selectedZoneIds.includes(z.id);
              if (!isSelected) return null;

              return (
                <div 
                  key={z.id}
                  className="absolute border-4 border-white rounded-lg bg-primary/40 shadow-2xl ring-4 ring-primary/10 animate-in zoom-in duration-300"
                  style={{ 
                    left: `${z.x}%`, 
                    top: `${z.y}%`, 
                    width: `${z.width}%`, 
                    height: `${z.height}%` 
                  }}
                />
              );
            })}

            {/* Diagnostic Results Overlay (Review Phase) */}
            {reviewMode && zones.map((z) => {
              const isSelected = selectedZoneIds.includes(z.id);
              const isCorrect = z.isCorrect;
              
              // Diagnostic State Protocol:
              // - Green: Correct node selected (isSelected && isCorrect)
              // - Red: Correct node missed (!isSelected && isCorrect)
              // - Orange: Wrong node selected (isSelected && !isCorrect)
              
              let borderColor = "border-transparent";
              let bgColor = "bg-transparent";
              let labelColor = "bg-slate-600";

              if (isSelected && isCorrect) {
                borderColor = "border-emerald-500";
                bgColor = "bg-emerald-500/20";
                labelColor = "bg-emerald-600";
              } else if (!isSelected && isCorrect) {
                borderColor = "border-rose-500";
                bgColor = "bg-rose-500/10";
                labelColor = "bg-rose-600";
              } else if (isSelected && !isCorrect) {
                borderColor = "border-orange-500";
                bgColor = "bg-orange-500/20";
                labelColor = "bg-orange-600";
              } else {
                // Distractor not touched
                borderColor = "border-slate-300/20";
              }

              return (
                <div 
                  key={z.id} 
                  className={cn(
                    "absolute border-2 transition-all duration-700 flex items-center justify-center rounded-sm",
                    borderColor,
                    bgColor
                  )} 
                  style={{ 
                    left: `${z.x}%`, 
                    top: `${z.y}%`, 
                    width: `${z.width}%`, 
                    height: `${z.height}%` 
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "option-text text-[9px] font-black text-white px-2 py-0.5 rounded-sm border shadow-xl backdrop-blur-md",
                      labelColor
                    )}>
                      {z.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {!reviewMode && (
        <div className="flex flex-col items-center gap-2">
          <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {selectedZoneIds.length} / {maxSelections} selected
            </p>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Click nodes to toggle identification
          </p>
        </div>
      )}
    </div>
  );
};
