import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * DNTRNG™ TELEMETRY PROXY
 * 
 * Forwards tracking events to the registry via the secure proxy.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Fire and forget to the bridge using the hardened proxy logic
    gasPost('logEvent', data).catch(err => {
      console.error('[Telemetry Failure]', err);
    });

    return NextResponse.json({ status: 'queued' });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
