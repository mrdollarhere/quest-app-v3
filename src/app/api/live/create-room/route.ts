
/**
 * /api/live/create-room
 * 
 * Purpose: Orchestrates the creation of a new real-time classroom node.
 * Updated: v18.9 - Added descriptive parameter validation and infrastructure audit.
 */

import { NextResponse } from 'next/server';
import { rooms, generateRoomCode } from '@/lib/live-rooms';

export async function POST(request: Request) {
  try {
    // INFRASTRUCTURE AUDIT: Ensure Pusher environment is ready
    const pusherConfigured = 
      !!process.env.PUSHER_APP_ID && 
      !!process.env.PUSHER_SECRET &&
      !!process.env.NEXT_PUBLIC_PUSHER_KEY &&
      !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherConfigured) {
      console.error('[Live Mode Error] Pusher environment variables are missing');
      return NextResponse.json({ 
        error: 'Live mode not configured',
        message: 'Pusher environment variables are not set on the server.'
      }, { status: 503 });
    }

    const body = await request.json();
    const { testId, testName, hostId, hostName } = body;
    
    // DESCRIPTIVE PARAMETER VALIDATION
    const missing = [];
    if (!testId) missing.push('testId');
    if (!testName) missing.push('testName');
    if (!hostId) missing.push('hostId');
    if (!hostName) missing.push('hostName');

    if (missing.length > 0) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        missing,
        received: Object.keys(body)
      }, { status: 400 });
    }

    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      roomCode,
      testId,
      testName,
      hostId,
      hostName,
      students: [],
      status: 'waiting',
      currentQuestion: 0,
      createdAt: Date.now()
    });

    return NextResponse.json({ roomCode, testId, hostId });
  } catch (err: any) {
    console.error('[Live Mode Error] Room creation exception:', err);
    return NextResponse.json({ 
      error: err.message || 'Internal Error',
      details: err.toString()
    }, { status: 400 });
  }
}
