
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface HotspotZone {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

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
  const [currentZone, setCurrentZone] = useState<{ x: number, y: number, r: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      try {
        const parsed = JSON.parse(initialData || "[]");
        setZones(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setZones([]);
      }
    }
  }, [open, initialData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setCurrentZone({ x, y, r: 2 }); // Initial small radius
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentZone || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const radius = Math.sqrt(Math.pow(x - currentZone.x, 2) + Math.pow(y - currentZone.y, 2));
    setCurrentZone({ ...currentZone, r: radius });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentZone) return;
    
    const newZone: HotspotZone = {
      id: `zone_${Date.now()}`,
      label: `New Zone ${zones.length + 1}`,
      x: currentZone.x,
      y: currentZone.y,
      radius: Math.max(currentZone.r, 2)
    };
    
    setZones([...zones, newZone]);
    setIsDrawing(false);
    setCurrentZone(null);
  };

  const updateLabel = (id: string, label: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, label } : z));
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
      <DialogContent className="sm:max-w-[1000px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white flex flex-col h-[90vh]">
        <div className="bg-slate-900 p-8 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Intelligence Zone Mapper</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest">Draw hotspots directly on the visual asset</DialogDescription>
            </div>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          {/* Main Drawing Area */}
          <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
            <div className="relative group w-full h-full flex items-center justify-center">
              {!imageUrl ? (
                <div className="text-center space-y-4 p-20 bg-white rounded-[2rem] border-4 border-dashed border-slate-200">
                  <AlertCircle className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="font-black text-slate-400 uppercase tracking-widest">No Visual Asset Detected</p>
                  <p className="text-xs text-slate-400">Please provide an Image URL in the question settings first.</p>
                </div>
              ) : (
                <div 
                  ref={containerRef}
                  className="relative cursor-crosshair shadow-2xl rounded-2xl overflow-hidden bg-black max-w-full max-h-full aspect-video"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <img 
                    src={imageUrl} 
                    alt="Map" 
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                  
                  {/* Current Drawing Zone */}
                  {currentZone && (
                    <div 
                      className="absolute border-4 border-primary bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ 
                        left: `${currentZone.x}%`, 
                        top: `${currentZone.y}%`, 
                        width: `${currentZone.r * 2}%`, 
                        height: `${currentZone.r * 2}%` 
                      }}
                    />
                  )}

                  {/* Saved Zones */}
                  {zones.map(z => (
                    <div 
                      key={z.id}
                      className="absolute border-2 border-white bg-green-500/40 rounded-full -translate-x-1/2 -translate-y-1/2 group/zone flex items-center justify-center"
                      style={{ 
                        left: `${z.x}%`, 
                        top: `${z.y}%`, 
                        width: `${z.radius * 2}%`, 
                        height: `${z.radius * 2}%` 
                      }}
                    >
                      <div className="opacity-0 group-hover/zone:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                        {z.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl">
                <Crosshair className="w-3 h-3 text-primary" />
                Click & Drag to define a zone
              </div>
            </div>
          </div>

          {/* Sidebar Management */}
          <div className="w-full lg:w-80 bg-white border-l border-slate-100 flex flex-col p-6 overflow-y-auto">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center justify-between">
              Zone Registry
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{zones.length}</span>
            </h3>
            
            <div className="space-y-4 flex-1">
              {zones.map((z, idx) => (
                <div key={z.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary">ZONE {idx + 1}</span>
                    <button onClick={() => removeZone(z.id)} className="text-slate-300 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Label</Label>
                    <Input 
                      value={z.label} 
                      onChange={(e) => updateLabel(z.id, e.target.value)}
                      className="h-8 rounded-lg bg-white border-none ring-1 ring-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div className="flex gap-4 text-[8px] font-mono text-slate-400">
                    <span>X: {z.x.toFixed(1)}%</span>
                    <span>Y: {z.y.toFixed(1)}%</span>
                    <span>R: {z.radius.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {zones.length === 0 && (
                <div className="py-12 text-center text-slate-300">
                  <Move className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Zones</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleCommit}
              disabled={!imageUrl}
              className="mt-8 w-full h-14 rounded-full bg-primary font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Commit Spatial Data
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
