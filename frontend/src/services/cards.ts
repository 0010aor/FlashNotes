import type { Card, CardCreate, CardUpdate } from '@/client'
import { getCardRepository } from '@/repositories/card/CardRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getCardRepository(isGuest())

export const getCards = async (collectionId: string): Promise<Card[]> => {
  return repo().getAll(collectionId)
}

export const getCardById = async (collectionId: string, id: string): Promise<Card | null> => {
  return repo().getById(collectionId, id)
}

export const createCard = async (collectionId: string, data: CardCreate): Promise<Card> => {
  return repo().create(collectionId, data)
}

export const updateCard = async (
  collectionId: string,
  id: string,
  data: CardUpdate,
): Promise<Card> => {
  return repo().update(collectionId, id, data)
}

export const deleteCard = async (collectionId: string, id: string): Promise<void> => {
  return repo().delete(collectionId, id)
}
