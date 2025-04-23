import { v4 as uuidv4 } from 'uuid'
import { type LocalCollection, db } from '../../db/flashcardsDB'

export const addLocalCollection = async (
  name: string,
  prompt?: string | null,
): Promise<LocalCollection> => {
  const newCollection: LocalCollection = {
    id: uuidv4(),
    name,
    prompt,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
  }
  await db.collections.add(newCollection)
  return newCollection
}

export const getLocalCollections = async (): Promise<LocalCollection[]> => {
  return await db.collections.orderBy('updatedAt').reverse().toArray()
}

export const getLocalCollectionById = async (id: string): Promise<LocalCollection> => {
  const collection = await db.collections.get(id)
  if (!collection) throw new Error('Collection not found')
  return collection
}

export const updateLocalCollection = async (
  id: string,
  updates: Partial<Pick<LocalCollection, 'name' | 'prompt'>>,
): Promise<number> => {
  const collection = await db.collections.get(id)
  if (!collection) throw new Error('Collection not found for update')
  return await db.collections.update(id, {
    ...updates,
    updatedAt: Date.now(),
    synced: false,
  })
}

export const deleteLocalCollection = async (id: string): Promise<void> => {
  await db.cards.where('collectionId').equals(id).delete()
  const sessions = await db.practice_sessions.where('collectionId').equals(id).toArray()
  for (const session of sessions) {
    await db.practice_cards.where('sessionId').equals(session.id).delete()
    await db.practice_sessions.delete(session.id)
  }
  await db.collections.delete(id)
}

export const markCollectionAsSynced = async (id: string): Promise<number> => {
  return await db.collections.update(id, { synced: true })
}

export const getUnsyncedCollections = async (): Promise<LocalCollection[]> => {
  return await db.collections.where('synced').equals(0).toArray()
}
