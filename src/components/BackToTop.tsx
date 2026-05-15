"use client";

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * DNTRNG™ VERTICAL NAVIGATION UTILITY
 * 
 * A floating control node that enables instantaneous return to the viewport origin.
 * Implementation: Scroll-aware threshold detection with smooth behavior.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Threshold Protocol: Reveal button after 400px of vertical travel
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-[100] h-14 w-14 rounded-full shadow-2xl border-2 transition-all duration-500 ease-in-out",
        "bg-white/80 backdrop-blur-md border-slate-100 text-slate-900 hover:scale-110 active:scale-95",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-20 opacity-0 scale-50 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="w-7 h-7" />
    </Button>
  );
}
