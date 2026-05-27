import { NextResponse } from 'next/server';

/**
 * GET /api/proxy/tests
 * Retrieves the available intelligence modules from the registry.
 * Optimized v19.9: Implementation of 1-minute server-side caching.
 */
export async function GET() {
  const urlString = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!urlString) {
    return NextResponse.json({ error: 'Infrastructure configuration missing' }, { status: 500 });
  }

  try {
    const url = new URL(urlString);
    url.searchParams.set('action', 'getTests');
    if (apiKey) url.searchParams.set('apiKey', apiKey);

    // CACHE PROTOCOL: Implementation of 60s Revalidation window
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Registry node unreachable');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Tests Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
