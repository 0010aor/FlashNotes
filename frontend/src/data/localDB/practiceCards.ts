import { v4 as uuidv4 } from 'uuid'
import { type LocalPracticeCard, db } from '../../db/flashcardsDB'

export const addLocalPracticeCard = async (
  sessionId: string,
  cardId: string,
): Promise<LocalPracticeCard> => {
  const newPracticeCard: LocalPracticeCard = {
    id: uuidv4(),
    sessionId,
    cardId,
    isPracticed: false,
    synced: false,
  }
  await db.practice_cards.add(newPracticeCard)
  return newPracticeCard
}

export const getLocalPracticeCardsForSession = async (
  sessionId: string,
): Promise<LocalPracticeCard[]> => {
  return await db.practice_cards.where('sessionId').equals(sessionId).toArray()
}

export const getLocalPracticeCardById = async (id: string): Promise<LocalPracticeCard> => {
  const card = await db.practice_cards.get(id)
  if (!card) throw new Error('Practice card not found')
  return card
}

export const updateLocalPracticeCard = async (
  id: string,
  updates: Partial<Omit<LocalPracticeCard, 'id' | 'sessionId' | 'cardId'>>,
): Promise<number> => {
  const card = await db.practice_cards.get(id)
  if (!card) throw new Error('Practice card not found for update')
  return await db.practice_cards.update(id, {
    ...updates,
    synced: false,
  })
}

export const deleteLocalPracticeCard = async (id: string): Promise<void> => {
  await db.practice_cards.delete(id)
}

export const markPracticeCardAsSynced = async (id: string): Promise<number> => {
  return await db.practice_cards.update(id, { synced: true })
}

export const getUnsyncedPracticeCardsForSession = async (
  sessionId: string,
): Promise<LocalPracticeCard[]> => {
  return await db.practice_cards.where({ sessionId: sessionId, synced: 0 }).toArray()
}

export async function getNextLocalPracticeCard(sessionId: string) {
  const practiceCardList = await db.practice_cards.where('sessionId').equals(sessionId).toArray()

  const next = practiceCardList.find((c) => !c.isPracticed)
  if (!next) return null

  const card = await db.cards.get(next.cardId)
  if (!card) throw new Error('Card not found for next practice')

  return { ...card, collection_id: card.collectionId }
}

async function markPracticeCardAsPracticed(practiceCardId: string, isCorrect: boolean) {
  await db.practice_cards.update(practiceCardId, {
    isCorrect,
    isPracticed: true,
    practicedAt: Date.now(),
    synced: false,
  })
}

async function updatePracticeSessionStats(sessionId: string, isCorrect: boolean) {
  const session = await db.practice_sessions.get(sessionId)
  if (!session) throw new Error('Practice session not found for update')
  const newCorrect = (session.correctAnswers ?? 0) + (isCorrect ? 1 : 0)
  const newPracticed = (session.cardsPracticed ?? 0) + 1
  const isCompleted = newPracticed >= (session.totalCards ?? 0)
  await db.practice_sessions.update(sessionId, {
    correctAnswers: newCorrect,
    cardsPracticed: newPracticed,
    isCompleted,
    completedAt: isCompleted ? Date.now() : undefined,
    synced: false,
  })
}

export async function updateLocalPracticeCardResult(
  sessionId: string,
  cardId: string,
  isCorrect: boolean,
) {
  const practiceCardList = await db.practice_cards.where('sessionId').equals(sessionId).toArray()
  const practiceCard = practiceCardList.find((c) => c.cardId === cardId)
  if (!practiceCard) throw new Error('Practice card not found for update')
  await markPracticeCardAsPracticed(practiceCard.id, isCorrect)
  await updatePracticeSessionStats(sessionId, isCorrect)
}
