
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { ResponsesTab } from '@/components/admin/ResponsesTab';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminResponsesPage() {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const [resRes, testsRes] = await Promise.all([
        fetch(`${API_URL}?action=getResponses`),
        fetch(`${API_URL}?action=getTests`)
      ]);
      const resData = await resRes.json();
      const testsData = await testsRes.json();
      
      setResponses(Array.isArray(resData) ? resData : []);
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch responses." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePost = async (action: string, payload: any) => {
    if (!API_URL) return;
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      toast({ title: "Success", description: "Registry updated." });
      setTimeout(fetchData, 1500);
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && responses.length === 0) {
    return (
      <div className="py-20">
        <AILoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResponsesTab 
        responses={responses} 
        tests={tests}
        loading={loading}
        onRefresh={fetchData}
        onDelete={(timestamp, email) => handlePost('deleteResponse', { timestamp, email })}
      />
    </div>
  );
}
