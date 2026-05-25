/**
 * font-loader.ts
 * 
 * Purpose: Handles dynamic fetching and base64 encoding of TTF fonts for PDF generation.
 * Logic: Implements a single-session cache node to minimize network travel.
 * Updated: v19.3.1 - Switched to stable jsDelivr CDN nodes.
 */

let cachedNormalFont: string | null = null;
let cachedBoldFont: string | null = null;

async function fetchAndBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font server returned ${response.status}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function loadRobotoFont(): Promise<string> {
  if (cachedNormalFont) return cachedNormalFont;
  // Stable CDN node for Roboto Regular
  const FONT_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf';
  try {
    cachedNormalFont = await fetchAndBase64(FONT_URL);
    return cachedNormalFont;
  } catch (err) {
    console.error('[PDF Font Loader] Normal font fetch failed:', err);
    throw err;
  }
}

export async function loadRobotoBoldFont(): Promise<string> {
  if (cachedBoldFont) return cachedBoldFont;
  // Stable CDN node for Roboto Bold
  const BOLD_FONT_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf';
  try {
    cachedBoldFont = await fetchAndBase64(BOLD_FONT_URL);
    return cachedBoldFont;
  } catch (err) {
    console.error('[PDF Font Loader] Bold font fetch failed:', err);
    throw err;
  }
}
