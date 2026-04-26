
/**
 * /api/live/status
 * 
 * Purpose: Public node for checking active live assessment rooms.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';

export async function GET() {
  const activeTests = new Set();
  rooms.forEach(room => {
    if (room.status !== 'ended') {
      activeTests.add(room.testId);
    }
  });
  return NextResponse.json({ liveTests: Array.from(activeTests) });
}
