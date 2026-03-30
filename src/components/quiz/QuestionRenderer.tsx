"use client";

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/quiz';
import { ImageIcon, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SingleChoiceModule } from './modules/SingleChoiceModule';
import { MultipleChoiceModule } from './modules/MultipleChoiceModule';
import { RatingModule } from './modules/RatingModule';
import { OrderingModule } from './modules/OrderingModule';
import { MatchingModule } from './modules/MatchingModule';
import { MultipleTrueFalseModule } from './modules/MultipleTrueFalseModule';
import { MatrixChoiceModule } from './modules/MatrixChoiceModule';
import { HotspotModule } from './modules/HotspotModule';
import { ShortTextModule } from './modules/ShortTextModule';
import { DropdownModule } from './modules/DropdownModule';
import { TrueFalseModule } from './modules/TrueFalseModule';

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
    // Protocol: Normalize type strings to handle spaces, underscores, and case sensitivity
    const qType = String(question.question_type || '').toLowerCase().replace(/\s+/g, '_');

    if (qType === 'multiple_choice' || qType === 'many_answers') {
      return <MultipleChoiceModule {...props} />;
    }
    
    if (qType === 'single_choice' || qType === 'one_answer') {
      return <SingleChoiceModule {...props} />;
    }

    switch (qType) {
      case 'rating': return <RatingModule {...props} />;
      case 'ordering': return <OrderingModule {...props} />;
      case 'matching': return <MatchingModule {...props} />;
      case 'hotspot': return <HotspotModule {...props} />;
      case 'multiple_true_false': return <MultipleTrueFalseModule {...props} />;
      case 'matrix_choice': return <MatrixChoiceModule {...props} />;
      case 'short_text': return <ShortTextModule {...props} />;
      case 'dropdown': return <DropdownModule {...props} />;
      case 'true_false': return <TrueFalseModule {...props} />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      <div className="p-6 bg-[#EFF6FF] border-l-[4px] border-[#2563EB] rounded-r-2xl mb-10">
        <h2 className="question-text text-lg md:text-xl font-bold leading-[1.65] text-slate-900 w-full">
          {question.question_text}
          {question.required && <span className="text-destructive ml-2">*</span>}
        </h2>
      </div>

      {!!imgSrc && question.question_type !== 'hotspot' && (
        <>
          <div 
            className="mb-10 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative group cursor-zoom-in"
            onClick={() => setIsZoomOpen(true)}
          >
            <img 
              src={imgSrc} 
              alt="Step Asset" 
              className="w-full h-auto object-cover max-h-[450px] transition-transform duration-700 group-hover:scale-[1.02]"
              onError={handleImageError}
            />
            {hasImageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm text-slate-400">
                <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Media Sync Failed</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
                <Maximize2 className="w-6 h-6 text-slate-900" />
              </div>
            </div>
          </div>

          <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                  src={imgSrc} 
                  alt="Zoomed Asset" 
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                />
                <DialogTitle className="sr-only">Image Perspective View</DialogTitle>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <div className="space-y-10">{renderModule()}</div>
    </div>
  );
};