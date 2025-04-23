import { v4 as uuidv4 } from 'uuid'
import { type LocalPracticeSession, db } from '../../db/flashcardsDB'

export const getLocalPracticeSessions = async (
  collectionId: string,
  limit?: number,
): Promise<LocalPracticeSession[]> => {
  if (limit && limit > 0) {
    return await db.practice_sessions
      .where('collectionId')
      .equals(collectionId)
      .limit(limit)
      .sortBy('startedAt')
  }
  return await db.practice_sessions.where('collectionId').equals(collectionId).sortBy('startedAt')
}

export const startLocalPracticeSession = async (
  collectionId: string,
): Promise<LocalPracticeSession> => {
  const now = Date.now()
  const newSession: LocalPracticeSession = {
    id: uuidv4(),
    collectionId,
    startedAt: now,
    isCompleted: false,
    totalCards: 0,
    cardsPracticed: 0,
    correctAnswers: 0,
    createdAt: now,
    updatedAt: now,
    practiceCards: [],
    synced: false,
  }
  await db.practice_sessions.add(newSession)
  return newSession
}
