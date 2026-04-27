
/**
 * /api/live/student-answer
 * 
 * Purpose: Records student response in the room memory node.
 * Updated: v18.9.2 - Corrected status check to 'active' to match terminal protocol.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const { roomCode, studentId, answer } = await request.json();
    const room = rooms.get(roomCode);

    // STATUS AUDIT: Allow submission only when room is in the active interaction phase
    if (!room || room.status !== 'active') {
      return NextResponse.json({ error: 'Assessment phase not active' }, { status: 403 });
    }

    const student = room.students.find(s => s.id === studentId);
    if (!student) return NextResponse.json({ error: 'Student node not found' }, { status: 404 });

    // Record answer in room memory
    student.answers[room.currentQuestion] = answer;

    const answeredCount = room.students.filter(s => s.answers[room.currentQuestion] !== undefined).length;

    // Notify Host of progress increment
    await pusherServer.trigger(`room-${roomCode}`, 'student-answered', {
      answeredCount,
      totalStudents: room.students.length
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Student Answer Error]', err);
    return NextResponse.json({ error: 'Sync Error' }, { status: 500 });
  }
}
