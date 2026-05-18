import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';
import { headers } from 'next/headers';

/**
 * POST /api/proxy/log-event
 * Telemetry proxy for site-wide events.
 * Forensicallly injects Client IP and Browser UA from request headers.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const headerList = await headers();
    
    // IP Resolution Protocol
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const ua = headerList.get('user-agent') || 'Unknown Browser';

    const enrichedPayload = {
      ...payload,
      ip,
      browser: ua
    };

    gasPost('logEvent', enrichedPayload).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
