/**
 * GlobalFeedback.tsx
 * 
 * Purpose: Renders a section of simulated global comments and ratings.
 * Logic: Displays a grid of high-fidelity operator feedback nodes in multiple languages.
 */

"use client";

import React from 'react';
import { Star, Globe, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackNode {
  name: string;
  location: string;
  comment: string;
  rating: number;
  lang: string;
}

const FEEDBACK_REGISTRY: FeedbackNode[] = [
  {
    name: "Sarah Jenkins",
    location: "United States",
    comment: "The fastest way to check student progress. Brilliant and straightforward!",
    rating: 5,
    lang: "en"
  },
  {
    name: "Minh Phan",
    location: "Vietnam",
    comment: "Hệ thống rất mượt mà. Rất tuyệt vời cho việc ôn tập từ vựng tiếng Anh.",
    rating: 5,
    lang: "vi"
  },
  {
    name: "Elena Rodriguez",
    location: "Spain",
    comment: "Muy útil para mis clases de historia. Los resultados instantáneos son clave.",
    rating: 4,
    lang: "es"
  },
  {
    name: "James Knight",
    location: "United Kingdom",
    comment: "A straightforward assessment tool that actually works. No fluff, just results.",
    rating: 5,
    lang: "en"
  },
  {
    name: "Thu Trang",
    location: "Vietnam",
    comment: "Giao diện hiện đại, dễ sử dụng. Thật sự hữu ích cho việc tự học tại nhà.",
    rating: 5,
    lang: "vi"
  },
  {
    name: "Marco Silva",
    location: "Brazil",
    comment: "Excelente ferramenta para treinamentos corporativos. Sincronização perfeita.",
    rating: 5,
    lang: "pt"
  }
];

export function GlobalFeedback() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Global Registry</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Voices from the Field.</h2>
            <p className="text-slate-500 font-medium max-w-xl">Real-time feedback from operators across the global intelligence network.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEEDBACK_REGISTRY.map((node, i) => (
            <div 
              key={i} 
              className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-50 group-hover:text-primary/5 transition-colors" />
              <div className="relative z-10 space-y-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={cn(
                        "w-4 h-4", 
                        idx < node.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"
                      )} 
                    />
                  ))}
                </div>
                <p className="text-slate-700 font-medium leading-relaxed italic">"{node.comment}"</p>
                <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                    {node.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{node.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{node.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
