import type { Card, CardCreate, CardUpdate } from '@/client'
import * as cards from '@/data/localDB/cards'
import type { LocalCard } from '@/db/flashcardsDB'
import type { CardRepository } from './CardRepository'

function toCard(local: LocalCard): Card {
  return {
    id: local.id,
    collection_id: local.collectionId,
    front: local.front,
    back: local.back,
  } as Card
}

export class LocalCardRepository implements CardRepository {
  async getAll(collectionId: string): Promise<Card[]> {
    const locals = await cards.getLocalCardsForCollection(collectionId)
    return locals.map(toCard)
  }

  async getById(collectionId: string, id: string): Promise<Card | null> {
    try {
      const local = await cards.getLocalCardById(id)
      return toCard(local)
    } catch (e) {
      return null
    }
  }

  async create(collectionId: string, data: CardCreate): Promise<Card> {
    const local = await cards.addLocalCard(collectionId, data.front, data.back)
    return toCard(local)
  }

  async update(collectionId: string, id: string, data: CardUpdate): Promise<Card> {
    const filteredData: Partial<Pick<LocalCard, 'front' | 'back'>> = {}
    if (typeof data.front !== 'undefined' && data.front !== null) filteredData.front = data.front
    if (typeof data.back !== 'undefined' && data.back !== null) filteredData.back = data.back
    await cards.updateLocalCard(id, filteredData)
    const updated = await cards.getLocalCardById(id)
    return toCard(updated)
  }

  async delete(collectionId: string, id: string): Promise<void> {
    await cards.deleteLocalCard(id)
  }
}
