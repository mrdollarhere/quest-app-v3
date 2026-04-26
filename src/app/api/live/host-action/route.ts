
/**
 * /api/live/host-action
 * 
 * Purpose: Teacher authorization node for controlling the quiz sequence.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';
import { pusherServer } from '@/lib/pusher';
import { API_URL } from '@/lib/api-config';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';

export async function POST(request: Request) {
  try {
    const { roomCode, action, data, hostId } = await request.json();
    const room = rooms.get(roomCode);

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.hostId !== hostId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    switch (action) {
      case 'start_question':
        room.status = 'question';
        room.currentQuestion = data.questionIndex;
        room.timeLimit = data.timeLimit;
        room.questionStartTime = Date.now();
        // Clear previous answers for this specific step if any
        room.students.forEach(s => delete s.answers[room.currentQuestion]);
        
        await pusherServer.trigger(`room-${roomCode}`, 'question-start', {
          questionIndex: room.currentQuestion,
          questionData: data.questionData,
          timeLimit: room.timeLimit
        });
        break;

      case 'reveal_answer':
        room.status = 'revealed';
        const qData = data.questionData;
        
        // Calculate points
        room.students.forEach(student => {
          const ans = student.answers[room.currentQuestion];
          const isCorrect = calculateScoreForQuestion(qData, ans);
          student.lastCorrect = isCorrect;
          if (isCorrect) student.score += 100; // Fixed live point protocol
        });

        const leaderboard = [...room.students]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        await pusherServer.trigger(`room-${roomCode}`, 'answer-reveal', {
          correctAnswer: qData.correct_answer,
          leaderboard,
          studentResults: room.students.map(s => ({ id: s.id, correct: s.lastCorrect, score: s.score }))
        });
        break;

      case 'next_question':
        room.status = 'waiting'; // Preparing for next step
        await pusherServer.trigger(`room-${roomCode}`, 'next-question', {});
        break;

      case 'end_session':
        room.status = 'ended';
        const finalLeaderboard = [...room.students].sort((a, b) => b.score - a.score);
        
        // Save to GAS Registry
        if (API_URL) {
          try {
            await Promise.all(room.students.map(s => 
              fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                  action: 'submitResponse',
                  testId: room.testId,
                  userName: s.name,
                  userEmail: `live_${roomCode}_${s.id}@student.live`,
                  score: s.score / 100, // Normalized for GAS
                  total: finalLeaderboard.length > 0 ? room.currentQuestion + 1 : 0,
                  mode: 'live'
                })
              })
            ));
          } catch (e) {}
        }

        await pusherServer.trigger(`room-${roomCode}`, 'session-ended', { finalLeaderboard });
        rooms.delete(roomCode); // Clean up memory
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (err) {
    return NextResponse.json({ error: 'Host operation failed' }, { status: 500 });
  }
}
