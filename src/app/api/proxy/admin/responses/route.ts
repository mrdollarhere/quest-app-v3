import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/utils/auth-helpers';
import { gasGet } from '@/lib/server/gas-proxy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/proxy/admin/responses
 * Protected route: Retrieves submission history.
 * Standardized v19.9: Using getAdminSession and force-dynamic for session reliability.
 */
export async function GET() {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await gasGet('getResponses');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[Proxy Responses Error]', error);
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
