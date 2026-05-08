import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/tests
 * Retrieves the available intelligence modules from the registry.
 */
export async function GET() {
  try {
    const data = await gasGet('getTests');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Tests Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
