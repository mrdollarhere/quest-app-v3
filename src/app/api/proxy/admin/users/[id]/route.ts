import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/utils/auth-helpers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/admin/users/[id]
 * 
 * Retrieves metadata for a single student identity.
 * Admin Only.
 * Updated v19.9: Added Cache-Control headers to prevent browser caching.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await gasGet('getUserById', { id });
    
    if (data && data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    // SECURITY PROTOCOL: Never return passwords from this node
    const { password, ...safeUser } = data || {};
    return NextResponse.json(safeUser, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('[Proxy Single User Error]', error);
    return NextResponse.json({ error: 'Registry unreachable' }, { status: 500 });
  }
}
