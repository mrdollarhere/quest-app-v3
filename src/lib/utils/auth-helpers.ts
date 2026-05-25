import { cookies } from 'next/headers';
import { parseJsonSafe } from './api-helpers';

/**
 * DNTRNG™ AUTHENTICATION NODE
 * 
 * Verifies the administrative clearance of a server-side request.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const c = cookieStore.get('auth-session');
  
  if (!c) return null;
  
  const session = parseJsonSafe(c.value, null) as any;
  if (!session || session.role !== 'admin') return null;
  
  return session;
}
