import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api-config';

/**
 * DNTRNG™ HEALTH MONITORING PROTOCOL
 * 
 * This route verifies the connectivity and latency of the Registry Bridge.
 * - Optimal: Responsive within 2 seconds.
 * - Degraded: Responsive but exceeding 2 seconds.
 * - Offline: No response or invalid configuration.
 */
export async function GET() {
  if (!API_URL) {
    return NextResponse.json({ status: 'Offline' });
  }

  try {
    const start = Date.now();
    
    // Set a timeout for the health check to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}?action=getSettings`, { 
      signal: controller.signal,
      cache: 'no-store' 
    });
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - start;

    if (res.ok) {
      if (duration > 2000) {
        return NextResponse.json({ status: 'Degraded' });
      }
      return NextResponse.json({ status: 'Optimal' });
    }
    
    return NextResponse.json({ status: 'Offline' });
  } catch (error) {
    return NextResponse.json({ status: 'Offline' });
  }
}
