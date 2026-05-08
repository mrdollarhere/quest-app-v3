import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/admin/save-user
 * Admin Only: Creates or updates a user node.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { data } = await request.json();
    await gasPost('saveUser', { data });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
