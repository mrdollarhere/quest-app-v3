import { NextResponse } from 'next/server';

/**
 * GET /api/proxy/public-stats
 * 
 * Retrieves global platform volume telemetry.
 * Cache Protocol: 5 Minute Revalidation.
 */
export async function GET() {
  const urlString = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!urlString) {
    return NextResponse.json({ error: 'Infrastructure configuration missing' }, { status: 500 });
  }

  try {
    const url = new URL(urlString);
    url.searchParams.set('action', 'getPublicStats');
    if (apiKey) url.searchParams.set('apiKey', apiKey);

    // CACHE PROTOCOL: Implementation of 300s Revalidation window
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error('Registry node rejected telemetry pulse');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Public Stats Error]', error);
    return NextResponse.json({ 
      learningSessions: 0,
      studentsTrained: 0,
      assessmentsDone: 0,
      practiceModules: 0
    });
  }
}
