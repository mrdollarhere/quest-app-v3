import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/utils/auth-helpers';
import { buildErrorResponse } from '@/lib/utils/api-helpers';
import { importUsersAI } from '@/ai/flows/user-import-flow';

/**
 * AI IDENTITY GENERATION PROTOCOL
 * 
 * Proxies the user import flow to provide automated identity extraction.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return buildErrorResponse('Unauthorized', 401);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return buildErrorResponse('AI features not configured', 503);

  try {
    const body = await request.json();
    const users = await importUsersAI(body);
    
    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    });
  } catch (error: any) {
    console.error('[AI User Import Error]', error);
    return buildErrorResponse('The intelligence node failed to parse the input.', 500);
  }
}
