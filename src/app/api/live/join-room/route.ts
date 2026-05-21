/**
 * /api/live/join-room
 * 
 * Purpose: Student entry node for Live Mode sessions.
 * Updated: v19.0.0 - Added join_mode awareness and mandatory name validation.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';
import { pusherServer } from '@/lib/pusher';
import { gasGet } from '@/lib/server/gas-proxy';
import { validateStudentName } from '@/lib/name-validator';

export async function POST(request: Request) {
  try {
    const { roomCode, studentName } = await request.json();
    const code = String(roomCode || "").toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // REGISTRY SETTINGS FETCH: Determine validation protocol
    let joinMode = 'open';
    let whitelist: string[] = [];
    
    try {
      const settings = await gasGet('getSettings');
      joinMode = settings.join_mode || 'open';
      whitelist = JSON.parse(settings.name_whitelist || '[]');
    } catch (e) {
      // Fail-Safe: Default to open mode if registry unreachable
      console.warn('[Live Join] Settings fetch failed, defaulting to open mode.');
    }

    // STATUS AUDIT PROTOCOL
    if (room.status === 'ended') {
      return NextResponse.json({ 
        error: 'THIS SESSION HAS ENDED — The host has closed this room.' 
      }, { status: 403 });
    }

    if (room.status === 'active' || room.status === 'revealed') {
      return NextResponse.json({ 
        error: 'SESSION IN PROGRESS — This assessment has already started.' 
      }, { status: 403 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ 
        error: 'Join attempts are locked for this session.' 
      }, { status: 403 });
    }

    if (room.students.length >= 50) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 });
    }

    // IDENTITY VALIDATION PROTOCOL
    if (joinMode === 'whitelist') {
      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
      const target = normalize(studentName);
      const isApproved = whitelist.some(n => normalize(n) === target);
      
      if (!isApproved) {
        return NextResponse.json({ 
          error: 'Your name is not on the approved list for this session. Please contact your teacher.' 
        }, { status: 403 });
      }
    } else {
      // Open Mode: High-Fidelity Validator
      const validation = validateStudentName(studentName);
      if (!validation.valid) {
        return NextResponse.json({ 
          error: validation.reason?.en || 'Please enter your real full name.' 
        }, { status: 400 });
      }
    }

    const studentId = 'std_' + Math.random().toString(36).substring(2, 9);
    const newStudent = { id: studentId, name: studentName, score: 0, answers: {} };
    room.students.push(newStudent);

    // Notify Lobby
    await pusherServer.trigger(`room-${code}`, 'student-joined', {
      studentName,
      totalStudents: room.students.length,
      students: room.students.map(s => ({ name: s.name, id: s.id }))
    });

    return NextResponse.json({ 
      success: true, 
      studentId, 
      testName: room.testName, 
      hostName: room.hostName,
      testId: room.testId
    });
  } catch (err) {
    console.error('[Live Join Error]', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
