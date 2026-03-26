"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { ResponsesTab } from '@/components/admin/ResponsesTab';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminResponsesPage() {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchResponses = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getResponses`);
      const data = await res.json();
      setResponses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch responses." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  if (loading && responses.length === 0) {
    return (
      <div className="py-20">
        <AILoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResponsesTab responses={responses} />
    </div>
  );
}
