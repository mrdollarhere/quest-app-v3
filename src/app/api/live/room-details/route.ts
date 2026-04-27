/**
 * /api/live/room-details
 * 
 * Purpose: Retrieves metadata for an active live room.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'Missing room code' }, { status: 400 });
    }

    const room = rooms.get(code.toUpperCase());

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      roomCode: room.roomCode,
      testId: room.testId,
      testName: room.testName,
      hostName: room.hostName,
      status: room.status,
      currentQuestion: room.currentQuestion,
      studentCount: room.students.length,
      students: room.students.map(s => ({ id: s.id, name: s.name }))
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
