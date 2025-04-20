import { v4 as uuidv4 } from 'uuid'
import { type LocalCard, db } from '../../db/flashcardsDB'

export const addLocalCard = async (
  collectionId: string,
  front: string,
  back: string,
): Promise<LocalCard> => {
  const newCard: LocalCard = {
    id: uuidv4(),
    collectionId,
    front,
    back,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
  }
  await db.cards.add(newCard)
  await db.collections.update(collectionId, {
    updatedAt: Date.now(),
    synced: false,
  })
  return newCard
}

export const getLocalCardsForCollection = async (
  collectionId: string,
  limit?: number,
): Promise<LocalCard[]> => {
  if (limit && limit > 0) {
    return await db.cards
      .where('collectionId')
      .equals(collectionId)
      .limit(limit)
      .sortBy('updatedAt')
  }
  return await db.cards.where('collectionId').equals(collectionId).sortBy('updatedAt')
}

export const getLocalCardById = async (id: string): Promise<LocalCard> => {
  const card = await db.cards.get(id)
  if (!card) throw new Error('Card not found')
  return card
}

export const updateLocalCard = async (
  id: string,
  updates: Partial<Pick<LocalCard, 'front' | 'back'>>,
): Promise<number> => {
  const card = await db.cards.get(id)
  if (!card) throw new Error('Card not found for update')
  const result = await db.cards.update(id, {
    ...updates,
    updatedAt: Date.now(),
    synced: false,
  })
  await db.collections.update(card.collectionId, {
    updatedAt: Date.now(),
    synced: false,
  })
  return result
}

export const deleteLocalCard = async (id: string): Promise<void> => {
  const card = await db.cards.get(id)
  if (!card) return
  await db.cards.delete(id)
  await db.collections.update(card.collectionId, {
    updatedAt: Date.now(),
    synced: false,
  })
}

export const markCardAsSynced = async (id: string): Promise<number> => {
  return await db.cards.update(id, { synced: true })
}

export const getUnsyncedCardsForCollection = async (collectionId: string): Promise<LocalCard[]> => {
  return await db.cards.where({ collectionId: collectionId, synced: 0 }).toArray()
}

export async function getLocalDifficultCardsForCollection(
  collectionId: string,
  minAttempts = 2,
  limit = 5,
) {
  // Get all sessions for the collection
  const sessions = await db.practice_sessions.where('collectionId').equals(collectionId).toArray()
  const sessionIds = sessions.filter((s) => s.isCompleted).map((s) => s.id)
  if (sessionIds.length === 0) return []

  // Get all practice cards for these sessions
  const allPracticeCards = await db.practice_cards.where('sessionId').anyOf(sessionIds).toArray()

  // Aggregate stats by cardId
  const statsMap: Record<string, { total_attempts: number; correct_answers: number }> = {}
  for (const pc of allPracticeCards) {
    if (!pc.isPracticed || typeof pc.isCorrect !== 'boolean') continue
    if (!statsMap[pc.cardId]) statsMap[pc.cardId] = { total_attempts: 0, correct_answers: 0 }
    statsMap[pc.cardId].total_attempts += 1
    if (pc.isCorrect) statsMap[pc.cardId].correct_answers += 1
  }

  // Get card info
  const cardIds = Object.keys(statsMap)
  const cards = await db.cards.bulkGet(cardIds)

  // Build result array
  const difficultCards = cardIds
    .map((cardId, idx) => ({
      id: cardId,
      front: cards[idx]?.front || '',
      total_attempts: statsMap[cardId].total_attempts,
      correct_answers: statsMap[cardId].correct_answers,
      accuracy:
        statsMap[cardId].total_attempts > 0
          ? statsMap[cardId].correct_answers / statsMap[cardId].total_attempts
          : 1,
    }))
    .filter((card) => card.total_attempts >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map(({ accuracy, ...rest }) => rest) // Remove accuracy from final output

  return difficultCards
}
