
/**
 * /api/live/create-room
 * 
 * Purpose: Orchestrates the creation of a new real-time classroom node.
 */

import { NextResponse } from 'next/server';
import { rooms, generateRoomCode } from '@/lib/live-rooms';

export async function POST(request: Request) {
  try {
    const { testId, testName, hostId, hostName } = await request.json();
    
    if (!testId || !hostId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
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
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
