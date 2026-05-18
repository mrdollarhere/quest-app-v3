"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * REDIRECT PROTOCOL: Events Terminal Deprecated
 * The Events page has been unified with the System Activity Hub.
 */
export default function DeprecatedEventsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/activity');
  }, [router]);

  return null;
}
