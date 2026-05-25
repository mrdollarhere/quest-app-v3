import { NextResponse } from 'next/server';
import { safeGasGet } from '@/lib/utils/gas-helpers';
import { getAdminSession } from '@/lib/utils/auth-helpers';
import { buildErrorResponse } from '@/lib/utils/api-helpers';

/**
 * GET /api/proxy/admin/activity
 * Refactored: v19.4.0 (Shared Auth Protocol)
 */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return buildErrorResponse('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';

  const data = await safeGasGet('getActivity', { limit });
  if (!data) return buildErrorResponse('Registry unreachable', 500);

  return NextResponse.json(data);
}
