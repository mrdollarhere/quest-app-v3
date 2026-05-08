import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/log-event
 * Telemetry proxy for site-wide events.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    gasPost('logEvent', payload).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
