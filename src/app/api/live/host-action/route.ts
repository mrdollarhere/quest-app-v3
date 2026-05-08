
/**
 * /api/live/host-action
 * 
 * Purpose: Teacher authorization node for controlling the quiz sequence.
 * Updated: v18.9.2 - Updated status transition to 'active' on question start.
 */

import { NextResponse } from 'next/server';
import { rooms } from '@/lib/live-rooms';
import { pusherServer } from '@/lib/pusher';
import { gasPost } from '@/lib/server/gas-proxy';
import { calculateScoreForQuestion } from '@/lib/quiz-utils';

export async function POST(request: Request) {
  try {
    const { roomCode, action, data, hostId } = await request.json();
    const room = rooms.get(String(roomCode).toUpperCase());

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.hostId !== hostId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    switch (action) {
      case 'start_question':
        room.status = 'active'; // Transition to active blocks new joins
        room.currentQuestion = data.questionIndex;
        room.timeLimit = data.timeLimit;
        room.questionStartTime = Date.now();
        room.activeQuestionData = data.questionData;
        
        // Reset responses for the current question
        room.students.forEach(s => {
          if (!s.answers) s.answers = {};
          delete s.answers[room.currentQuestion];
        });
        
        await pusherServer.trigger(`room-${roomCode}`, 'question-start', {
          questionIndex: room.currentQuestion,
          questionData: data.questionData,
          timeLimit: room.timeLimit
        });
        break;

      case 'reveal_answer':
        room.status = 'revealed';
        const qData = room.activeQuestionData;
        
        if (!qData) {
          return NextResponse.json({ error: 'No active question data found' }, { status: 400 });
        }
        
        // Calculate points and updates
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
        // status remains active/revealed until explicitly changed by next_question or end
        await pusherServer.trigger(`room-${roomCode}`, 'next-question', {});
        break;

      case 'end_session':
        room.status = 'ended';
        const finalLeaderboard = [...room.students].sort((a, b) => b.score - a.score);
        
        // Background push to GAS via secure server context (Attempt-Best Protocol)
        room.students.forEach(s => {
          gasPost('submitResponse', {
            testId: room.testId,
            userName: s.name,
            userEmail: `live_${roomCode}_${s.id}@student.live`,
            score: s.score / 100, // Normalized for GAS (1 correct = 1 point)
            total: room.currentQuestion + 1,
            mode: 'live'
          }).catch(() => {});
        });

        await pusherServer.trigger(`room-${roomCode}`, 'session-ended', { finalLeaderboard });
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error('[Host Action Error]', err);
    return NextResponse.json({ error: 'Host operation failed' }, { status: 500 });
  }
}
