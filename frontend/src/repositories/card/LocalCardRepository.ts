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
  }
}

export class LocalCardRepository implements CardRepository {
  async getAll(collectionId: string): Promise<Card[]> {
    const locals = await cards.getLocalCardsForCollection(collectionId)
    return locals.map(toCard)
  }

  async getById(_collectionId: string, id: string): Promise<Card | null> {
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

  async update(_collectionId: string, id: string, data: CardUpdate): Promise<Card> {
    await cards.updateLocalCard(id, {
      front: data.front ?? undefined,
      back: data.back ?? undefined,
    })
    const updated = await cards.getLocalCardById(id)
    return toCard(updated)
  }

  async delete(_collectionId: string, id: string): Promise<void> {
    await cards.deleteLocalCard(id)
  }
}
