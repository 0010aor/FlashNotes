import { type LocalPracticeCard, db } from '../../db/flashcardsDB'

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

export async function updateLocalPracticeCard(
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
  return {
    ...next,
    front: card.front,
    back: card.back,
    collectionId: card.collectionId,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  }
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
