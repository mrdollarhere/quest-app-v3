import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/admin/bug-reports/status
 * Admin Only: Calibrates the status and notes of an issue node.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id, status, note } = await request.json();
    
    if (!['new', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status protocol' }, { status: 400 });
    }

    await gasPost('updateBugStatus', { id, status, note });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Registry update error' }, { status: 500 });
  }
}
