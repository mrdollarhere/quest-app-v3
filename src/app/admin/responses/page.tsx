"use client";

import React from 'react';
import { ResponsesTab } from '@/components/admin/ResponsesTab';
import { AILoader } from '@/components/ui/ai-loader';
import { useAdminData } from '@/hooks/useAdminData';

/**
 * DNTRNG™ RESPONSES TERMINAL
 * 
 * Refactored: v19.4.0 (Phase 2 Hardening)
 * Purpose: Diagnostic interface for mission submission logs.
 */
export default function AdminResponsesPage() {
  const { data: responsesData, loading, refresh } = useAdminData({
    url: '/api/proxy/admin/responses',
    initialData: []
  });

  const { data: testsData } = useAdminData({
    url: '/api/proxy/tests',
    initialData: []
  });

  const handleDelete = async (timestamp: string, email: string) => {
    try {
      const res = await fetch('/api/proxy/admin/delete-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, email })
      });
      if (res.ok) refresh();
    } catch (e) {
      console.error('[Delete Error]', e);
    }
  };

  if (loading && responsesData.length === 0) {
    return <div className="py-20"><AILoader messages={["Accessing Submission Registry..."]} /></div>;
  }

  return (
    <div className="space-y-6">
      <ResponsesTab 
        responses={responsesData} 
        tests={testsData}
        loading={loading}
        onRefresh={refresh}
        onDelete={handleDelete}
      />
    </div>
  );
}
