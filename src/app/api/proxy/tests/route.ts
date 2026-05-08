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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
