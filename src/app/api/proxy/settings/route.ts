import { NextResponse } from 'next/server';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * GET /api/proxy/settings
 * Retrieves global platform settings with sensitive keys stripped.
 */
export async function GET() {
  try {
    const settings = await gasGet('getSettings');
    
    // SECURITY PROTOCOL: Never expose salts or registry URLs to the client
    const { daily_key_salt, google_sheet_url, ...safe } = settings || {};
    
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
