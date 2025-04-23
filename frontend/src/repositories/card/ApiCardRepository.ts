import { FlashcardsService } from '@/client'
import type { Card, CardCreate, CardUpdate } from '@/client'
import type { CardRepository } from './CardRepository'

export class ApiCardRepository implements CardRepository {
  async getAll(collectionId: string): Promise<Card[]> {
    const result = await FlashcardsService.readCards({ collectionId })
    return result.data
  }

  async getById(collectionId: string, id: string): Promise<Card | null> {
    try {
      return await FlashcardsService.readCard({ cardId: id, collectionId })
    } catch (e) {
      return null
    }
  }

  async create(collectionId: string, data: CardCreate): Promise<Card> {
    return FlashcardsService.createCard({ collectionId, requestBody: data })
  }

  async update(collectionId: string, id: string, data: CardUpdate): Promise<Card> {
    return FlashcardsService.updateCard({ cardId: id, collectionId, requestBody: data })
  }

  async delete(collectionId: string, id: string): Promise<void> {
    await FlashcardsService.deleteCard({ cardId: id, collectionId })
  }
}
