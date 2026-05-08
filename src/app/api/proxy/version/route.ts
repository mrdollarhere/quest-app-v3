import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/version
 * Public: Proxies the version check to GAS.
 */
export async function GET() {
  try {
    const data = await gasGet('getVersion');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Registry error' }, { status: 500 });
  }
}
