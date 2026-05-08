
import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/responses
 * 
 * Standard student-facing node for retrieving submission history.
 * Correctness and sensitive analytics are preserved as they were 
 * calculated during mission finalization.
 */
export async function GET() {
  try {
    const data = await gasGet('getResponses');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
