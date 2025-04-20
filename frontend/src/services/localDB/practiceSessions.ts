import { v4 as uuidv4 } from 'uuid'
import { type LocalPracticeSession, db } from '../../db/flashcardsDB'

export const addLocalPracticeSession = async (
  collectionId: string,
  totalCards: number,
): Promise<LocalPracticeSession> => {
  const newSession: LocalPracticeSession = {
    id: uuidv4(),
    collectionId,
    startedAt: Date.now(),
    isCompleted: false,
    totalCards,
    cardsPracticed: 0,
    correctAnswers: 0,
    synced: false,
  }
  await db.practice_sessions.add(newSession)
  return newSession
}

export const getLocalPracticeSessions = async (
  collectionId: string,
): Promise<LocalPracticeSession[]> => {
  return await db.practice_sessions.where('collectionId').equals(collectionId).sortBy('startedAt')
}

export const getLocalPracticeSessionById = async (id: string): Promise<LocalPracticeSession> => {
  const session = await db.practice_sessions.get(id)
  if (!session) throw new Error('Practice session not found')
  return session
}

export const updateLocalPracticeSession = async (
  id: string,
  updates: Partial<Omit<LocalPracticeSession, 'id' | 'collectionId' | 'startedAt'>>,
): Promise<number> => {
  const session = await db.practice_sessions.get(id)
  if (!session) throw new Error('Practice session not found for update')
  return await db.practice_sessions.update(id, {
    ...updates,
    synced: false,
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

export const startLocalPracticeSession = async (collectionId: string) => {
  const session = await db.practice_sessions
    .where('collectionId')
    .equals(collectionId)
    .filter((session) => session.isCompleted === false)
    .last()

  if (session) {
    return session
  }

  const cards = await db.cards.where('collectionId').equals(collectionId).toArray()
  const newSession = await addLocalPracticeSession(collectionId, cards.length)
  const practiceCards = cards.map((card) => ({
    id: uuidv4(),
    sessionId: newSession.id,
    cardId: card.id,
    isPracticed: false,
    synced: false,
  }))
  await db.practice_cards.bulkAdd(practiceCards)
  return newSession
}
