
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-config';
import { ActivityTab } from '@/components/admin/ActivityTab';
import { Loader2 } from 'lucide-react';

export default function AdminActivityPage() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getActivity`);
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch activity logs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-bold text-muted-foreground">Syncing Operational Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActivityTab activities={activities} />
    </div>
  );
}
