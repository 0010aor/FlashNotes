import { v4 as uuidv4 } from 'uuid'
import { type LocalCard, db } from '../../db/flashcardsDB'

async function removeIncompletePracticeSessionsForCollection(collectionId: string) {
  const sessions = await db.practice_sessions
    .where('collectionId')
    .equals(collectionId)
    .filter((session) => session.isCompleted === false || session.isCompleted === undefined)
    .toArray()
  for (const session of sessions) {
    await db.practice_cards.where('sessionId').equals(session.id).delete()
    await db.practice_sessions.delete(session.id)
  }
}

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
  await removeIncompletePracticeSessionsForCollection(collectionId)
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
  await removeIncompletePracticeSessionsForCollection(card.collectionId)
}

export const getLocalCardsForCollections = async (
  collectionIds: string[],
): Promise<LocalCard[]> => {
  if (!collectionIds.length) return []
  return await db.cards.where('collectionId').anyOf(collectionIds).toArray()
}
