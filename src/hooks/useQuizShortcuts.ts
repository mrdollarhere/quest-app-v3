/**
 * useQuizShortcuts.ts
 * 
 * Purpose: Global keyboard listener for quiz interaction nodes.
 * Extracted v19.6 (Phase 2 Refactor).
 */

import { useEffect, useState } from 'react';

interface ShortcutOptions {
  onNext: () => void;
  onPrev: () => void;
  onToggleSidebar: () => void;
  onSetTextSize: (size: 'small' | 'normal' | 'large') => void;
  isRaceMode: boolean;
  isAnswerConfirmed: boolean;
  canNext: boolean;
}

export function useQuizShortcuts({ onNext, onPrev, onToggleSidebar, onSetTextSize, isRaceMode, isAnswerConfirmed, canNext }: ShortcutOptions) {
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const triggerFeedback = (key: string) => {
    setActiveShortcut(key);
    setTimeout(() => setActiveShortcut(null), 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (canNext) { e.preventDefault(); triggerFeedback('next'); onNext(); }
          break;
        case 'ArrowLeft':
          if (!isRaceMode && !isAnswerConfirmed) { e.preventDefault(); triggerFeedback('prev'); onPrev(); }
          break;
        case 'g':
        case 'G':
          if (!isRaceMode) { triggerFeedback('grid'); onToggleSidebar(); }
          break;
        case '+':
        case '=':
          onSetTextSize('large'); triggerFeedback('font-plus');
          break;
        case '-':
        case '_':
          onSetTextSize('small'); triggerFeedback('font-minus');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onToggleSidebar, onSetTextSize, isRaceMode, isAnswerConfirmed, canNext]);

  return activeShortcut;
}
