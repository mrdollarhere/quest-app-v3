import { NextResponse } from 'next/server';

/**
 * DNTRNG™ VISUAL PROXY NODE
 * 
 * Purpose: Resolves CORS restrictions when fetching external assets for document extraction.
 * Security: Implements SSRF protection by blocking internal IP ranges.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // 1. PROTOCOL VALIDATION
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }

    // 2. SSRF PROTECTION PROTOCOL
    const internalPatterns = [
      /^localhost/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^0\./
    ];

    try {
      const parsed = new URL(targetUrl);
      const hostname = parsed.hostname;
      if (internalPatterns.some(pattern => pattern.test(hostname))) {
        return NextResponse.json({ error: 'Restricted registry node' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Malformed URL' }, { status: 400 });
    }

    // 3. PROXY HANDSHAKE WITH TIMEOUT
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*'
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json({ error: 'Registry asset unreachable' }, { status: 404 });
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      return new Response(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return NextResponse.json({ error: 'Handshake timeout' }, { status: 408 });
      }
      throw err;
    }
  } catch (error) {
    console.error('[Image Proxy Failure]', error);
    return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
  }
}
