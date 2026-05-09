import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gasGet } from '@/lib/server/gas-proxy';

/**
 * POST /api/proxy/auth/login
 * 
 * Performs identity handshake and sets secure httpOnly cookie.
 * Ensures case-insensitive email processing.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Normalization: Ensure email is lowercase for registry consistency
    const normalizedEmail = String(email).toLowerCase().trim();
    
    const user = await gasGet('login', { email: normalizedEmail, password });

    if (user && user.role && !user.error) {
      const cookieStore = await cookies();
      
      // SECURITY PROTOCOL: Set secure httpOnly session cookie
      // maxAge: 24 Hours (86400s) default, or synced with app settings
      cookieStore.set('auth-session', JSON.stringify({
        userId: user.id || user.email,
        role: user.role,
        email: normalizedEmail,
        name: user.name || user.displayName,
        image_url: user.image_url
      }), { 
        httpOnly: true, 
        sameSite: 'strict', 
        maxAge: 86400,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });

      // Remove sensitive fields before returning to client
      const { password: _, ...safeUser } = user;
      return NextResponse.json({
        ...safeUser,
        email: normalizedEmail
      });
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error: any) {
    console.error('[Proxy Login Error]', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again later.' }, { status: 500 });
  }
}
