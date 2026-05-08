import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/auth/login
 * Performs identity handshake and sets secure httpOnly cookie.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await gasGet('login', { email, password });

    if (user && user.role && !user.error) {
      const cookieStore = await cookies();
      
      // SECURITY PROTOCOL: Set secure httpOnly session cookie
      cookieStore.set('auth-session', JSON.stringify({
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name || user.displayName,
        image_url: user.image_url
      }), { 
        httpOnly: true, 
        sameSite: 'strict', 
        maxAge: 86400, // 24 Hours
        secure: process.env.NODE_ENV === 'production'
      });

      // Remove sensitive fields before returning to client
      const { password: _, ...safeUser } = user;
      return NextResponse.json(safeUser);
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[Proxy Login Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
