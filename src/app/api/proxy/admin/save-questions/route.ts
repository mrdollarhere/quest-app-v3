import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasPost } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/admin/save-questions
 * Admin Only: Overwrites a module's question set.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const payload = await request.json();
    await gasPost('saveQuestions', payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
