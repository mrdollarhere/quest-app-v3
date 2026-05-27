import { NextResponse } from 'next/server';

/**
 * GET /api/proxy/settings
 * Retrieves global platform settings with sensitive keys stripped.
 * Optimized v19.9: Implementation of 5-minute server-side caching.
 */
export async function GET() {
  const urlString = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!urlString) {
    return NextResponse.json({ error: 'Infrastructure configuration missing' }, { status: 500 });
  }

  try {
    const url = new URL(urlString);
    url.searchParams.set('action', 'getSettings');
    if (apiKey) url.searchParams.set('apiKey', apiKey);

    // CACHE PROTOCOL: Implementation of 300s Revalidation window
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Registry node unreachable');
    }

    const settings = await response.json();
    
    // SECURITY PROTOCOL: Never expose salts or registry URLs to the client
    const { daily_key_salt, google_sheet_url, ...safe } = settings || {};
    
    return NextResponse.json(safe);
  } catch (error) {
    console.error('[Proxy Settings Error]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
