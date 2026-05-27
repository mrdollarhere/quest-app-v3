"use client";

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

interface UseAdminDataOptions<T> {
  url: string;
  initialData: T;
  onSuccess?: (data: T) => void;
}

/**
 * useAdminData Hook
 * 
 * Standardizes the data acquisition pulse for administrative terminals.
 * Updated v19.9: Explicitly including credentials for cross-environment session reliability.
 */
export function useAdminData<T>({ url, initialData, onSuccess }: UseAdminDataOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`Registry error: ${res.status}`);
      }
      
      const result = await res.json();
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setError(err);
      // Quiet toast to allow the internal page error boundary to handle the visual state
      console.warn(`[Registry Fetch Warning] ${url} -> ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData, setData };
}
