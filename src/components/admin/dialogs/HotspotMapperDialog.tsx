
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  Trash2, 
  Crosshair, 
  Move, 
  CheckCircle2, 
  AlertCircle,
  X,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HotspotZone } from '@/types/quiz';

interface HotspotMapperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  initialData: string;
  onSave: (data: string) => void;
}

export function HotspotMapperDialog({ open, onOpenChange, imageUrl, initialData, onSave }: HotspotMapperDialogProps) {
  const [zones, setZones] = useState<HotspotZone[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Partial<HotspotZone> | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0.5625); // Default 16:9
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      try {
        const parsed = JSON.parse(initialData || "[]");
        const migrated = Array.isArray(parsed) ? parsed.map(z => {
          if ('radius' in z && !('width' in z)) {
            const r = (z as any).radius;
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
        setZones(migrated);
      } catch (e) {
        setZones([]);
      }
    }
  }, [open, initialData]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setAspectRatio(img.naturalHeight / img.naturalWidth);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentRect({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(startPoint.x - x),
      height: Math.abs(startPoint.y - y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    
    // Minimum size protocol (2%)
    if ((currentRect.width || 0) > 1 && (currentRect.height || 0) > 1) {
      const newZone: HotspotZone = {
        id: `zone_${Date.now()}`,
        label: `Target ${zones.length + 1}`,
        x: currentRect.x || 0,
        y: currentRect.y || 0,
        width: currentRect.width || 0,
        height: currentRect.height || 0,
        isCorrect: true
      };
      setZones([...zones, newZone]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const updateZone = (id: string, updates: Partial<HotspotZone>) => {
    setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const handleCommit = () => {
    onSave(JSON.stringify(zones));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white flex flex-col h-[90vh]">
        <div className="bg-slate-900 p-8 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Intelligence Zone Mapper</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest">Draw rectangular zones to build your registry</DialogDescription>
            </div>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8 bg-slate-50">
            <div className="min-h-full flex flex-col items-center justify-center">
              <div className="relative group w-full flex items-center justify-center mb-8">
                {!imageUrl ? (
                  <div className="text-center space-y-4 p-20 bg-white rounded-[2rem] border-4 border-dashed border-slate-200">
                    <AlertCircle className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="font-black text-slate-400 uppercase tracking-widest">No Visual Asset Detected</p>
                    <p className="text-xs text-slate-400">Provide an Image URL in settings first.</p>
                  </div>
                ) : (
                  <div 
                    className="relative shadow-2xl rounded-2xl overflow-hidden bg-black w-full max-w-full"
                    style={{ paddingBottom: `${aspectRatio * 100}%`, height: 0 }}
                  >
                    <div 
                      ref={containerRef}
                      className="absolute inset-0 cursor-crosshair"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    >
                      <img 
                        src={imageUrl} 
                        alt="Map" 
                        onLoad={handleImageLoad}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        draggable={false} 
                      />
                      
                      {/* Live Drawing Preview */}
                      {currentRect && (
                        <div 
                          className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none"
                          style={{ 
                            left: `${currentRect.x}%`, 
                            top: `${currentRect.y}%`, 
                            width: `${currentRect.width}%`, 
                            height: `${currentRect.height}%` 
                          }}
                        />
                      )}

                      {/* Zone Registry Overlays */}
                      {zones.map(z => (
                        <div 
                          key={z.id}
                          className={cn(
                            "absolute border-2 transition-all flex items-center justify-center group/zone",
                            z.isCorrect ? "border-green-400 bg-green-500/10" : "border-rose-400 bg-rose-500/10"
                          )}
                          style={{ 
                            left: `${z.x}%`, 
                            top: `${z.y}%`, 
                            width: `${z.width}%`, 
                            height: `${z.height}%` 
                          }}
                        >
                          <div className="opacity-0 group-hover/zone:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap z-10">
                            {z.label} {z.isCorrect ? "(Correct)" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl z-20">
                <Crosshair className="w-3 h-3 text-primary" />
                Click and drag to define spatial nodes
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white border-l border-slate-100 flex flex-col p-6 overflow-y-auto">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center justify-between">
              Spatial Registry
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{zones.length} Nodes</span>
            </h3>
            
            <div className="space-y-4 flex-1">
              {zones.map((z, idx) => (
                <div key={z.id} className={cn(
                  "p-5 rounded-[1.5rem] border-2 transition-all space-y-4 group",
                  z.isCorrect ? "bg-green-50/30 border-green-100" : "bg-rose-50/30 border-rose-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary">ID: {idx + 1}</span>
                      {z.isCorrect && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                    <button onClick={() => removeZone(z.id)} className="text-slate-300 hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Identification</Label>
                      <Input 
                        value={z.label} 
                        onChange={(e) => updateZone(z.id, { label: e.target.value })}
                        className="h-9 rounded-xl bg-white border-none ring-1 ring-slate-200 text-xs font-bold"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl ring-1 ring-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Correct Target</span>
                        <span className="text-[10px] font-medium text-slate-500">{z.isCorrect ? "Point Awarded" : "Distractor"}</span>
                      </div>
                      <Switch 
                        checked={!!z.isCorrect} 
                        onCheckedChange={(val) => updateZone(z.id, { isCorrect: val })} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase">
                    <span>X: {z.x.toFixed(1)}%</span>
                    <span>Y: {z.y.toFixed(1)}%</span>
                    <span>W: {z.width.toFixed(1)}%</span>
                    <span>H: {z.height.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {zones.length === 0 && (
                <div className="py-20 text-center text-slate-300">
                  <Move className="w-10 h-10 mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Registry Empty</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleCommit}
              disabled={!imageUrl || zones.length === 0}
              className="mt-8 w-full h-16 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Commit Registry
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
