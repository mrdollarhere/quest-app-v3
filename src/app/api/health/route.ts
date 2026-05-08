import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * DNTRNG™ HEALTH MONITORING PROTOCOL
 * 
 * Verifies connectivity of the Registry Bridge via the secure proxy.
 */
export async function GET() {
  try {
    const start = Date.now();
    
    // Use proxy logic to check health
    await gasGet('getSettings');
    
    const duration = Date.now() - start;

    if (duration > 2000) {
      return NextResponse.json({ status: 'Degraded' });
    }
    return NextResponse.json({ status: 'Optimal' });
  } catch (error) {
    return NextResponse.json({ status: 'Offline' });
  }
}
