"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Question } from '@/types/quiz';
import { ImageIcon, Maximize2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy Load interaction modules for performance
const SingleChoiceModule = dynamic(() => import('./modules/SingleChoiceModule').then(m => m.SingleChoiceModule), { 
  ssr: false, 
  loading: () => <Skeleton className="h-40 w-full rounded-2xl" /> 
});
const MultipleChoiceModule = dynamic(() => import('./modules/MultipleChoiceModule').then(m => m.MultipleChoiceModule), { 
  ssr: false, 
  loading: () => <Skeleton className="h-40 w-full rounded-2xl" /> 
});
const RatingModule = dynamic(() => import('./modules/RatingModule').then(m => m.RatingModule), { 
  ssr: false 
});
const OrderingModule = dynamic(() => import('./modules/OrderingModule').then(m => m.OrderingModule), { 
  ssr: false, 
  loading: () => <Skeleton className="h-60 w-full rounded-2xl" /> 
});
const MatchingModule = dynamic(() => import('./modules/MatchingModule').then(m => m.MatchingModule), { 
  ssr: false, 
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" /> 
});
const MultipleTrueFalseModule = dynamic(() => import('./modules/MultipleTrueFalseModule').then(m => m.MultipleTrueFalseModule), { 
  ssr: false 
});
const MatrixChoiceModule = dynamic(() => import('./modules/MatrixChoiceModule').then(m => m.MatrixChoiceModule), { 
  ssr: false, 
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" /> 
});
const HotspotModule = dynamic(() => import('./modules/HotspotModule').then(m => m.HotspotModule), { 
  ssr: false 
});
const ShortTextModule = dynamic(() => import('./modules/ShortTextModule').then(m => m.ShortTextModule), { 
  ssr: false 
});
const DropdownModule = dynamic(() => import('./modules/DropdownModule').then(m => m.DropdownModule), { 
  ssr: false 
});
const TrueFalseModule = dynamic(() => import('./modules/TrueFalseModule').then(m => m.TrueFalseModule), { 
  ssr: false 
});

interface Props {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  reviewMode?: boolean;
}

export const QuestionRenderer: React.FC<Props> = ({ question, value, onChange, reviewMode }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [hasImageError, setHasImageError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    setImgSrc(question.image_url && question.image_url.trim() !== "" ? question.image_url : undefined);
    setHasImageError(false);
  }, [question.id, question.image_url]);

  const handleImageError = () => {
    setImgSrc('https://picsum.photos/seed/dntrng-placeholder/800/450');
    setHasImageError(true);
  };

  const renderModule = () => {
    const props = { question, value, onChange, reviewMode };
    const qType = String(question.question_type || '').toLowerCase().replace(/[\s_]/g, '');

    if (qType === 'multiple_choice' || qType === 'multiplechoice' || qType === 'manyanswers' || qType === 'many_answers') {
      return <MultipleChoiceModule {...props} />;
    }
    
    if (qType === 'single_choice' || qType === 'singlechoice' || qType === 'oneanswer' || qType === 'one_answer') {
      return <SingleChoiceModule {...props} />;
    }

    switch (qType) {
      case 'rating': return <RatingModule {...props} />;
      case 'ordering': return <OrderingModule {...props} />;
      case 'matching': return <MatchingModule {...props} />;
      case 'hotspot': return <HotspotModule {...props} />;
      case 'multiple_true_false': 
      case 'multipletruefalse': return <MultipleTrueFalseModule {...props} />;
      case 'matrix_choice': 
      case 'matrixchoice': return <MatrixChoiceModule {...props} />;
      case 'short_text': 
      case 'shorttext': return <ShortTextModule {...props} />;
      case 'dropdown': return <DropdownModule {...props} />;
      case 'true_false': 
      case 'truefalse': return <TrueFalseModule {...props} />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      <div className="p-6 bg-[#EFF6FF] border-l-[4px] border-[#2563EB] rounded-r-2xl mb-10" role="group" aria-labelledby={`q-text-${question.id}`}>
        <h2 id={`q-text-${question.id}`} className="question-text text-lg md:text-xl font-bold leading-[1.65] text-slate-900 w-full">
          {question.question_text}
          {question.required && (
            <span className="text-destructive ml-2" aria-hidden="true">
              *
              <span className="sr-only"> (required)</span>
            </span>
          )}
        </h2>
      </div>

      {!!imgSrc && question.question_type !== 'hotspot' && (
        <div className="relative mb-10">
          <button 
            className="w-full block rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative group cursor-zoom-in outline-none focus-visible:ring-4 focus-visible:ring-primary"
            onClick={() => setIsZoomOpen(true)}
            aria-label="Zoom assessment image"
          >
            <div className="relative aspect-video w-full max-h-[450px]">
              <Image 
                src={imgSrc} 
                alt="Assessment Visual Asset" 
                fill
                priority={true}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                onError={handleImageError}
              />
            </div>
            {hasImageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm text-slate-500">
                <ImageIcon className="w-12 h-12 mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Media Sync Failed</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
                <Maximize2 className="w-6 h-6 text-slate-900" aria-hidden="true" />
              </div>
            </div>
          </button>

          <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-[90vh]">
                  <Image 
                    src={imgSrc} 
                    alt="Zoomed Asset View" 
                    fill
                    className="object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                  />
                </div>
                <DialogTitle className="sr-only">Image Perspective View</DialogTitle>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-10">{renderModule()}</div>
    </div>
  );
};
