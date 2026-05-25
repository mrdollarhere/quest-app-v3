import { NextResponse } from 'next/server';

/**
 * DNTRNG™ API PROTOCOL HELPERS
 * 
 * Standardized utilities for JSON handling and error responses.
 */

export function parseJsonSafe<T>(str: any, fallback: T): T {
  if (typeof str !== 'string' || !str.trim()) return fallback;
  try {
    const parsed = JSON.parse(str);
    return (parsed !== null && parsed !== undefined) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

export function buildErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function formatDate(date: Date | string | number, locale = 'en-GB'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString(locale);
}
