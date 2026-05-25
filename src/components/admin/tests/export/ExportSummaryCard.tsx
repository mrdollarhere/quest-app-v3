"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ExportSummaryCardProps {
  format: string;
  count: number | string;
  versions: number;
  withAnswers: boolean;
  watermarkEnabled: boolean;
  shuffleActive: boolean;
}

export function ExportSummaryCard({ 
  format, count, versions, withAnswers, watermarkEnabled, shuffleActive 
}: ExportSummaryCardProps) {
  return (
    <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden border-none shadow-2xl">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Info className="w-16 h-16" />
      </div>
      <div className="relative z-10 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Export Summary / Tóm Tắt</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
          <SummaryNode label="Format" value={format.toUpperCase()} />
          <SummaryNode label="Items" value={count} />
          <SummaryNode label="Versions" value={`${versions}${versions > 1 ? ' (ZIP)' : ''}`} />
          <SummaryNode label="Answers" value={withAnswers ? 'Yes' : 'No'} />
          {watermarkEnabled && <SummaryNode label="Security" value="Watermark On" />}
          <SummaryNode label="Shuffle" value={shuffleActive ? 'Active' : 'Off'} />
        </div>
      </div>
    </Card>
  );
}

function SummaryNode({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
      <p className="text-xs font-bold text-white uppercase">{value}</p>
    </div>
  );
}
