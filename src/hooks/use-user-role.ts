
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { API_URL } from '@/lib/api-config';

export function useUserRole() {
  const { user, loading: authLoading } = useUser();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user?.email || !API_URL) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}?action=getRole&email=${user.email}`);
        const data = await response.json();
        setRole(data.role || 'user');
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (user) {
        fetchRole();
      } else {
        setRole(null);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return { role, loading: loading || authLoading, user };
}
