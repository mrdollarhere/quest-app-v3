/**
 * live-rooms.ts
 * 
 * Purpose: In-memory registry for real-time assessment rooms.
 * Features: Automatic cleanup, room state management, student tracking.
 */

export interface LiveStudent {
  id: string;
  name: string;
  score: number;
  answers: Record<number, any>; // questionIndex -> answer
  lastCorrect?: boolean;
}

export interface LiveRoom {
  roomCode: string;
  testId: string;
  testName: string;
  hostId: string;
  hostName: string;
  students: LiveStudent[];
  status: 'waiting' | 'question' | 'revealed' | 'ended';
  currentQuestion: number;
  createdAt: number;
  questionStartTime?: number;
  timeLimit?: number;
  activeQuestionData?: any; // Stores current question for scoring
}

// Memory Registry: Use a global object to persist across serverless warm starts if possible
const globalRooms = global as unknown as { liveRooms: Map<string, LiveRoom> };
if (!globalRooms.liveRooms) {
  globalRooms.liveRooms = new Map();
}

export const rooms = globalRooms.liveRooms;

/**
 * CLEANUP PROTOCOL
 * Removes rooms older than 2 hours.
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const timeout = 2 * 60 * 60 * 1000; // 2 hours
    rooms.forEach((room, code) => {
      if (now - room.createdAt > timeout) {
        rooms.delete(code);
      }
    });
  }, 10 * 60 * 1000); // Check every 10 mins
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Collision Check
  if (rooms.has(code)) return generateRoomCode();
  return code;
}
