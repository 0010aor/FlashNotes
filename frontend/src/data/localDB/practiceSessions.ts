import type { PracticeCardResponse } from '@/client/types.gen'
import { v4 as uuidv4 } from 'uuid'
import { type LocalPracticeSession, db } from '../../db/flashcardsDB'
import type { LocalPracticeCard } from '../../db/flashcardsDB'

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

async function getUncompletedSession(
  collectionId: string,
): Promise<LocalPracticeSession | undefined> {
  return await db.practice_sessions
    .where('collectionId')
    .equals(collectionId)
    .filter((session) => session.isCompleted === false || session.isCompleted === undefined)
    .first()
}

async function deleteSessionAndPracticeCards(sessionId: string) {
  await db.practice_cards.where('sessionId').equals(sessionId).delete()
  await db.practice_sessions.delete(sessionId)
}

async function createPracticeSession(
  collectionId: string,
  totalCards: number,
  now: number,
): Promise<LocalPracticeSession> {
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
    synced: false,
  }
  await db.practice_sessions.add(newSession)
  return newSession
}

async function createPracticeCardsForSession(sessionId: string, cards: any[]) {
  const practiceCards: LocalPracticeCard[] = cards.map((card) => ({
    id: uuidv4(),
    sessionId,
    cardId: card.id,
    isPracticed: false,
    synced: false,
  }))
  await db.practice_cards.bulkAdd(practiceCards)
}

export const startLocalPracticeSession = async (
  collectionId: string,
): Promise<LocalPracticeSession> => {
  const now = Date.now()
  const existingSession = await getUncompletedSession(collectionId)
  if (existingSession) {
    if (existingSession.cardsPracticed === 0) {
      await deleteSessionAndPracticeCards(existingSession.id)
    } else {
      return existingSession
    }
  }
  const cards = await db.cards.where('collectionId').equals(collectionId).toArray()
  if (!cards.length) {
    throw new Error('Cannot create practice session for empty collection')
  }
  const newSession = await createPracticeSession(collectionId, cards.length, now)
  await createPracticeCardsForSession(newSession.id, cards)
  return newSession
}

export const getLocalPracticeCardsForSession = async (sessionId: string) => {
  return await db.practice_cards.where('sessionId').equals(sessionId).toArray()
}

export async function getNextLocalPracticeCard(
  sessionId: string,
): Promise<PracticeCardResponse | null> {
  const practiceCardList = await db.practice_cards.where('sessionId').equals(sessionId).toArray()
  const next = practiceCardList.find((c) => !c.isPracticed)
  if (!next) return null
  const card = await db.cards.get(next.cardId)
  if (!card) throw new Error('Card not found for next practice')
  return {
    card: {
      id: card.id,
      front: card.front,
      back: card.back,
      collection_id: card.collectionId,
    },
    is_practiced: next.isPracticed ?? false,
    is_correct: next.isCorrect ?? null,
  }
}

export async function getPracticeCardsForSession(
  sessionId: string,
): Promise<PracticeCardResponse[]> {
  const practiceCardList = await db.practice_cards.where('sessionId').equals(sessionId).toArray()
  return Promise.all(
    practiceCardList.map(async (practiceCard) => {
      const card = await db.cards.get(practiceCard.cardId)
      if (!card) throw new Error('Card not found for practice card list')
      return {
        card: {
          id: card.id,
          front: card.front,
          back: card.back,
          collection_id: card.collectionId,
        },
        is_practiced: practiceCard.isPracticed ?? false,
        is_correct: practiceCard.isCorrect ?? null,
      }
    }),
  )
}

async function getPracticedCount(sessionId: string): Promise<number> {
  return await db.practice_cards
    .where({ sessionId })
    .filter((card) => card.isPracticed)
    .count()
}

async function getCorrectCount(sessionId: string): Promise<number> {
  return await db.practice_cards
    .where({ sessionId })
    .filter((card) => card.isCorrect === true)
    .count()
}

async function updateSessionStatsAfterPractice(sessionId: string) {
  const session = await db.practice_sessions.get(sessionId)
  if (!session) throw new Error('Practice session not found for update')
  const practicedCount = await getPracticedCount(sessionId)
  const correctCount = await getCorrectCount(sessionId)
  const isCompleted = practicedCount >= (session.totalCards ?? 0)
  await db.practice_sessions.update(sessionId, {
    cardsPracticed: practicedCount,
    correctAnswers: correctCount,
    isCompleted,
    updatedAt: Date.now(),
    completedAt: isCompleted ? Date.now() : undefined,
    synced: false,
  })
}

export async function submitCardResult(sessionId: string, cardId: string, isCorrect: boolean) {
  const practiceCard = await db.practice_cards.where({ sessionId, cardId }).first()
  if (!practiceCard) throw new Error('Practice card not found for update')
  await db.practice_cards.update(practiceCard.id, {
    isCorrect,
    isPracticed: true,
    practicedAt: Date.now(),
    synced: false,
  })
  await updateSessionStatsAfterPractice(sessionId)
}
