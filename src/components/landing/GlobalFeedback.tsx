/**
 * GlobalFeedback.tsx
 * 
 * Purpose: Renders a section of simulated global comments and ratings in an automated carousel.
 * Logic: Uses Embla Carousel with a state-linked timer for autonomous navigation.
 * Visual: Adheres to the Rectangular Geometry Protocol (rounded-none).
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Star, Globe, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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
    name: "Akira Sato",
    location: "Japan",
    comment: "非常に使いやすく、リアルタイムの同期が素晴らしいです。教育現場に最適です。",
    rating: 5,
    lang: "ja"
  },
  {
    name: "Elena Rodriguez",
    location: "Spain",
    comment: "Muy útil para mis clases de historia. Los resultados instantáneos son clave.",
    rating: 4,
    lang: "es"
  },
  {
    name: "Amélie Laurent",
    location: "France",
    comment: "Une interface intuitive et une synchronisation ultra-rapide. Je recommande vivement.",
    rating: 5,
    lang: "fr"
  },
  {
    name: "James Knight",
    location: "United Kingdom",
    comment: "A straightforward assessment tool that actually works. No fluff, just results.",
    rating: 5,
    lang: "en"
  },
  {
    name: "Hans Müller",
    location: "Germany",
    comment: "Die Performance ist beeindruckend. Google Sheets als Datenbank zu nutzen ist genial.",
    rating: 5,
    lang: "de"
  }
];

export function GlobalFeedback() {
  const [api, setApi] = useState<CarouselApi>();

  // AUTONOMOUS SLIDE PROTOCOL
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-24 bg-[#F8FAFC] border-y border-slate-100">
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
          
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => api?.scrollPrev()}
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => api?.scrollNext()}
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-none"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Carousel 
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {FEEDBACK_REGISTRY.map((node, i) => (
              <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="h-full p-10 bg-white rounded-none border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-50 group-hover:text-primary/5 transition-colors" />
                  
                  <div className="relative z-10 space-y-8">
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
                    
                    <p className="text-slate-700 font-medium leading-relaxed italic text-lg">
                      "{node.comment}"
                    </p>
                  </div>

                  <div className="pt-10 mt-10 border-t border-slate-100 flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-none bg-slate-900 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {node.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{node.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{node.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex justify-center gap-2">
          {FEEDBACK_REGISTRY.map((_, i) => (
            <button 
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1 transition-all duration-500",
                api?.selectedScrollSnap() === i ? "w-8 bg-primary" : "w-4 bg-slate-200"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
