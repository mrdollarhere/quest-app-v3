import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api-config';

/**
 * DNTRNG™ TELEMETRY PROXY
 * 
 * Forwards tracking events from the client to the Google Sheets registry.
 * Operates on a "respond-first" protocol to minimize client latency.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!API_URL) {
      return NextResponse.json({ status: 'skipped', reason: 'API_URL not configured' });
    }

    // Forward to GAS logEvent action without awaiting for a fast client response
    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Critical for GAS bridge stability
      body: JSON.stringify({ action: 'logEvent', ...data })
    }).catch(err => {
      console.error('[Telemetry Failure]', err);
    });

    return NextResponse.json({ status: 'queued' });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
