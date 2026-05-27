import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';
import { validateReportContent } from '@/lib/report-validator';

/**
 * POST /api/proxy/bug-report
 * Public route: Allows any student to submit technical discrepancies.
 * Protocol v19.3: Relaxed validation to support automated diagnostic snapshots.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // 1. CONTENT VALIDATION
    // If description exists, enforce respect protocol. 
    // If empty, it's considered an automated snapshot.
    const result = validateReportContent(payload.description || "");
    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    const reportId = "br_" + Date.now();
    const enrichedPayload = {
      ...payload,
      id: reportId,
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    // 2. REGISTRY HANDSHAKE
    await gasPost('saveBugReport', enrichedPayload);
    
    return NextResponse.json({ success: true, id: reportId });
  } catch (error: any) {
    console.error('[Bug Report Proxy Error]', error);
    return NextResponse.json({ error: 'Failed to submit report to registry' }, { status: 500 });
  }
}
