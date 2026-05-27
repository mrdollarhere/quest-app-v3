import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/profile/stats
 * 
 * Retrieves aggregated performance history for the logged-in student.
 * Authenticated access required.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const c = cookieStore.get('auth-session');
    
    if (!c) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(c.value);
    if (!session.email) {
      return NextResponse.json({ error: 'Identity node corrupted' }, { status: 400 });
    }

    const data = await gasGet('getUserStats', { email: session.email });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Profile Stats Error]', error);
    return NextResponse.json({ error: 'Failed to fetch interaction statistics' }, { status: 500 });
  }
}
