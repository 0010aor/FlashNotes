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

export const getLocalCardsForCollection = async (collectionId: string): Promise<LocalCard[]> => {
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
