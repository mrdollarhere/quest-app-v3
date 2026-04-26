
/**
 * pusher.ts
 * 
 * Purpose: Centralized Pusher instances for server-side and client-side communication.
 */

import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side instance (requires secret)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side instance (public key only)
// Note: Initialized here but usually instantiated in a hook/component to avoid SSR issues
export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/live/pusher-auth',
  });
};
