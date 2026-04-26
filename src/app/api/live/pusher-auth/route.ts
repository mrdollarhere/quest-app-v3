
/**
 * /api/live/pusher-auth
 * 
 * Purpose: Standard Pusher private channel authentication node.
 */

import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;

    const auth = pusherServer.authenticate(socketId, channelName);
    return NextResponse.json(auth);
  } catch (err) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 403 });
  }
}
