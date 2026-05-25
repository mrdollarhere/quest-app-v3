/**
 * font-loader.ts
 * 
 * Purpose: Handles dynamic fetching and base64 encoding of TTF fonts for PDF generation.
 * Logic: Implements a single-session cache node to minimize network travel.
 */

let cachedFont: string | null = null;

export async function loadRobotoFont(): Promise<string> {
  if (cachedFont) return cachedFont;

  // Roboto Regular TTF - Supports Vietnamese Unicode
  // Source: Google Fonts CDN
  const FONT_URL = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf';

  try {
    const response = await fetch(FONT_URL);
    if (!response.ok) throw new Error(`Font server returned ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    
    // Binary to Base64 Conversion Protocol
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    cachedFont = window.btoa(binary);
    return cachedFont;
  } catch (err) {
    console.error('[PDF Font Loader] Network error or CORS violation:', err);
    throw err;
  }
}
