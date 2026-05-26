import { NextResponse } from 'next/server';
import { gasPost } from '@/lib/server/gas-proxy';
import { validateReportContent } from '@/lib/report-validator';

/**
 * POST /api/proxy/bug-report
 * Public route: Allows any student to submit technical discrepancies.
 * Protocol v19.2.1: Hardened payload integrity and content validation.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // SERVER-SIDE ENFORCEMENT PROTOCOL
    const validation = validateReportContent(payload.description || "");
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
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
