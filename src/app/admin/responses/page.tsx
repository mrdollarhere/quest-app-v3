"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ResponsesTab } from '@/components/admin/ResponsesTab';
import { AILoader } from '@/components/ui/ai-loader';

export default function AdminResponsesPage() {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Registry Protocol: Protected Proxy Fetch
      const [resRes, testsRes] = await Promise.all([
        fetch('/api/proxy/admin/responses'),
        fetch('/api/proxy/tests')
      ]);
      
      const resData = await resRes.json();
      const testsData = await testsRes.json();
      
      setResponses(Array.isArray(resData) ? resData : []);
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Access Denied", description: "Submission registry is protected." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      <ResponsesTab 
        responses={responses} 
        tests={tests}
        loading={loading}
        onRefresh={fetchData}
        onDelete={(timestamp, email) => {
          fetch('/api/proxy/admin/delete-response', {
            method: 'POST',
            body: JSON.stringify({ timestamp, email })
          }).then(() => fetchData());
        }}
      />
    </div>
  );
}
