import { v4 as uuidv4 } from 'uuid'
import { type LocalPracticeSession, db } from '../../db/flashcardsDB'

export const addLocalPracticeSession = async (
  collectionId: string,
  totalCards: number,
): Promise<LocalPracticeSession> => {
  const now = Date.now()
  const newSession: LocalPracticeSession = {
    id: uuidv4(),
    collectionId,
    startedAt: now,
    isCompleted: false,
    totalCards,
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

export const getLocalPracticeSessionById = async (id: string): Promise<LocalPracticeSession> => {
  const session = await db.practice_sessions.get(id)
  if (!session) throw new Error('Practice session not found')
  return session
}

export const updateLocalPracticeSession = async (
  id: string,
  updates: Partial<Omit<LocalPracticeSession, 'id' | 'createdAt'>>,
): Promise<void> => {
  const session = await db.practice_sessions.get(id)
  if (!session) throw new Error('Session not found')
  await db.practice_sessions.update(id, {
    ...updates,
    updatedAt: Date.now(),
    ...(updates.practiceCards ? { practiceCards: updates.practiceCards } : {}),
  })
}

export const deleteLocalPracticeSession = async (id: string): Promise<void> => {
  await db.practice_cards.where('sessionId').equals(id).delete()
  await db.practice_sessions.delete(id)
}

export const markPracticeSessionAsSynced = async (id: string): Promise<number> => {
  return await db.practice_sessions.update(id, { synced: true })
}

export const getUnsyncedPracticeSessions = async (): Promise<LocalPracticeSession[]> => {
  return await db.practice_sessions.where('synced').equals(0).toArray()
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
