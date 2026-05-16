/**
 * QuizLoadingManager.tsx
 * 
 * Purpose: Orchestrates all cognitive evaluation loading states within the quiz mission.
 * Logic: Synchronizes background data resolution with visual AI simulation cycles.
 */

"use client";

import React from 'react';
import { AILoader } from '@/components/ui/ai-loader';

interface QuizLoadingManagerProps {
  isSubmitting: boolean;
  isSubmissionDataReady: boolean;
  onSubmissionComplete: () => void;
  isInitialLoading: boolean;
  isInitialDataReady: boolean;
  onInitialComplete: () => void;
  isSyncingTraining: boolean;
}

export function QuizLoadingManager({
  isSubmitting,
  isSubmissionDataReady,
  onSubmissionComplete,
  isInitialLoading,
  isInitialDataReady,
  onInitialComplete,
  isSyncingTraining
}: QuizLoadingManagerProps) {
  
  if (isInitialLoading || isSyncingTraining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AILoader 
          showBrand={true} 
          isDataReady={isInitialDataReady}
          onComplete={onInitialComplete}
        />
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <AILoader 
          showBrand={true} 
          isDataReady={isSubmissionDataReady}
          onComplete={onSubmissionComplete}
        />
      </div>
    );
  }

  return null;
}
