import type { Card, Collection, CollectionCreate, CollectionUpdate } from '@/client'
import * as cards from '@/data/localDB/cards'
import * as collections from '@/data/localDB/collections'
import type { LocalCollection } from '@/db/flashcardsDB'
import type { CollectionRepository } from './CollectionRepository'

async function toCollection(local: LocalCollection): Promise<Collection> {
  const localCards = await cards.getLocalCardsForCollection(local.id)
  return {
    id: local.id,
    name: local.name,
    user_id: '',
    cards: localCards.map((card) => ({
      id: card.id,
      collection_id: card.collectionId,
      front: card.front,
      back: card.back,
    })) as Card[],
  }
}

export class LocalCollectionRepository implements CollectionRepository {
  async getAll(): Promise<Collection[]> {
    const locals = await collections.getLocalCollections()
    return Promise.all(locals.map(toCollection))
  }

  async getById(id: string): Promise<Collection | null> {
    try {
      const local = await collections.getLocalCollectionById(id)
      return await toCollection(local)
    } catch (e) {
      return null
    }
  }

  async create(data: CollectionCreate): Promise<Collection> {
    const local = await collections.addLocalCollection(data.name, data.prompt)
    return await toCollection(local)
  }

  async update(id: string, data: CollectionUpdate): Promise<Collection> {
    await collections.updateLocalCollection(id, { name: data.name ?? undefined })
    const updated = await collections.getLocalCollectionById(id)
    return await toCollection(updated)
  }

  async delete(id: string): Promise<void> {
    await collections.deleteLocalCollection(id)
  }
}
