import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/admin/questions
 * Admin Only: Retrieves questions WITH correct answers for editing.
 * Updated v19.9: Added Cache-Control headers to prevent browser caching.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const session = JSON.parse(c.value);
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing module ID' }, { status: 400 });

  try {
    const data = await gasGet('getQuestions', { id });
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
