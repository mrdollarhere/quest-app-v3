import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/admin/responses
 * Protected route: Retrieves submission history.
 * Updated v19.9: Added Cache-Control headers to prevent browser caching.
 */
export async function GET() {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await gasGet('getResponses');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
