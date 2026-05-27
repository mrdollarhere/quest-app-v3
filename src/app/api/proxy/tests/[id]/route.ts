import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/tests/[id]
 * 
 * Retrieves metadata for a single assessment module.
 * Public/Admin access.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing module ID' }, { status: 400 });
    }

    const data = await gasGet('getTestById', { id });
    
    if (data && data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Single Test Error]', error);
    return NextResponse.json({ error: 'Registry unreachable' }, { status: 500 });
  }
}
