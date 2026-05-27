import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet, gasPost } from '@/lib/server/gas-proxy';

/**
 * /api/proxy/admin/settings
 * 
 * Provides full access to the platform registry settings for administrators.
 * Supports both retrieval (GET) and calibration (POST).
 * Updated v19.9: Added Cache-Control headers to GET response.
 */

export async function GET() {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    // Admin access: Return full settings including sensitive fields (salt, sheet URL)
    const data = await gasGet('getSettings');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { key, value } = await request.json();
    await gasPost('saveSetting', { key, value });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
