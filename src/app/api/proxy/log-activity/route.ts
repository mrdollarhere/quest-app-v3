import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/log-activity
 * Non-blocking registry logger for session transitions.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    // Fire and forget to the bridge
    gasPost('logActivity', payload).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true }); // Always return success for logging
  }
}
