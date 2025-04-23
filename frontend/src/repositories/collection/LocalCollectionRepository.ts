import type { Card, Collection, CollectionCreate, CollectionUpdate } from '@/client'
import * as cards from '@/data/localDB/cards'
import * as collections from '@/data/localDB/collections'
import type { LocalCard, LocalCollection } from '@/db/flashcardsDB'
import type { CollectionRepository } from './CollectionRepository'

function toCard(local: LocalCard): Card {
  return {
    id: local.id,
    collection_id: local.collectionId,
    front: local.front,
    back: local.back,
  }
}

async function toCollection(local: LocalCollection, localCards: LocalCard[]): Promise<Collection> {
  return {
    id: local.id,
    name: local.name,
    user_id: '',
    cards: localCards.map(toCard),
  }
}

export class LocalCollectionRepository implements CollectionRepository {
  async getAll(): Promise<Collection[]> {
    const locals = await collections.getLocalCollections()
    const collectionIds = locals.map((col) => col.id)
    const allCards = await cards.getLocalCardsForCollections(collectionIds)
    const cardsByCollection: Record<string, LocalCard[]> = {}
    for (const card of allCards) {
      if (!cardsByCollection[card.collectionId]) cardsByCollection[card.collectionId] = []
      cardsByCollection[card.collectionId].push(card)
    }
    return Promise.all(
      locals.map((local) => toCollection(local, cardsByCollection[local.id] || [])),
    )
  }

  async getById(id: string): Promise<Collection | null> {
    try {
      const local = await collections.getLocalCollectionById(id)
      const localCards = await cards.getLocalCardsForCollection(local.id)
      return await toCollection(local, localCards)
    } catch (e) {
      console.error(`Failed to get collection by id ${id}:`, e)
      return null
    }
  }

  async create(data: CollectionCreate): Promise<Collection> {
    const local = await collections.addLocalCollection(data.name, data.prompt)
    const localCards: LocalCard[] = []
    return await toCollection(local, localCards)
  }

  async update(id: string, data: CollectionUpdate): Promise<Collection> {
    await collections.updateLocalCollection(id, { name: data.name ?? undefined })
    const updated = await collections.getLocalCollectionById(id)
    const localCards = await cards.getLocalCardsForCollection(updated.id)
    return await toCollection(updated, localCards)
  }

  async delete(id: string): Promise<void> {
    await collections.deleteLocalCollection(id)
  }
}
