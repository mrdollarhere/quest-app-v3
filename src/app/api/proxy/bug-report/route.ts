import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/bug-report
 * Public route: Allows any student to submit technical discrepancies.
 * Protocol v19.2.1: Hardened payload integrity.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    if (!payload.description || payload.description.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (payload.description.length > 500) {
      return NextResponse.json({ error: 'Description too long (max 500 chars)' }, { status: 400 });
    }

    const reportId = "br_" + Date.now();
    const enrichedPayload = {
      ...payload,
      id: reportId
    };

    // Registry Handshake: Call saveBugReport with explicit action
    await gasPost('saveBugReport', enrichedPayload);
    
    return NextResponse.json({ success: true, id: reportId });
  } catch (error: any) {
    console.error('[Bug Report Proxy Error]', error);
    return NextResponse.json({ error: 'Failed to submit report to registry' }, { status: 500 });
  }
}
