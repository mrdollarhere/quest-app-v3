
/**
 * /api/live/student-answer
 * 
 * Purpose: Records student response in the room memory node.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const { roomCode, studentId, answer } = await request.json();
    const room = rooms.get(roomCode);

    if (!room || room.status !== 'question') {
      return NextResponse.json({ error: 'Question not active' }, { status: 403 });
    }

    const student = room.students.find(s => s.id === studentId);
    if (!student) return NextResponse.json({ error: 'Student not in room' }, { status: 404 });

    student.answers[room.currentQuestion] = answer;

    const answeredCount = room.students.filter(s => s.answers[room.currentQuestion] !== undefined).length;

    await pusherServer.trigger(`room-${roomCode}`, 'student-answered', {
      answeredCount,
      totalStudents: room.students.length
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Sync Error' }, { status: 500 });
  }
}
