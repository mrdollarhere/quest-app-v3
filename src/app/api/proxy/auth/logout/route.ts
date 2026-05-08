import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/proxy/auth/logout
 * Terminates the secure session.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-session');
  return NextResponse.json({ success: true });
}
