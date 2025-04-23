import type { Card, CardCreate, CardUpdate } from '@/client'

export interface CardRepository {
  getAll(collectionId: string): Promise<Card[]>
  getById(collectionId: string, id: string): Promise<Card | null>
  create(collectionId: string, data: CardCreate): Promise<Card>
  update(collectionId: string, id: string, data: CardUpdate): Promise<Card>
  delete(collectionId: string, id: string): Promise<void>
}
