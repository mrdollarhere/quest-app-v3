"use client";

import { useToast } from './use-toast';

/**
 * useToastHelper
 * 
 * Specialized wrapper for standardized notification nodes.
 */
export function useToastHelper() {
  const { toast } = useToast();

  return {
    showSuccess: (title: string, description?: string) => 
      toast({ title, description }),
    showError: (title: string, description?: string) => 
      toast({ variant: "destructive", title, description }),
    showLoading: (title: string, description?: string) => 
      toast({ title, description })
  };
}
