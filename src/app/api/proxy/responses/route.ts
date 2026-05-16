import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/responses
 * 
 * Standard student-facing node for retrieving submission history.
 * Implements Identity-Targeted Retrieval to ensure students get their 
 * full history even if it falls outside the global recent record cap.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const c = cookieStore.get('auth-session');
    
    // Identity Protocol: Extract email from secure session for targeted lookup
    const session = c ? JSON.parse(c.value) : null;
    const email = session?.email;

    // Registry Handshake: Pass email to GAS to bypass global 2000-record slice
    const data = await gasGet('getResponses', email ? { email } : {});
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Proxy Responses Error]', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
