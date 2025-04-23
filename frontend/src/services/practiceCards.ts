import type { Card, CardCreate, CardUpdate } from '@/client'
import { getCardRepository } from '@/repositories/card/CardRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getCardRepository(isGuest())

export const getPracticeCards = async (sessionId: string): Promise<Card[]> => {
  return repo().getAll(sessionId)
}

export const getPracticeCardById = async (id: string, sessionId: string): Promise<Card | null> => {
  return repo().getById(id, sessionId)
}

export const createPracticeCard = async (sessionId: string, data: CardCreate): Promise<Card> => {
  return repo().create(sessionId, data)
}

export const updatePracticeCard = async (
  sessionId: string,
  id: string,
  data: CardUpdate,
): Promise<Card> => {
  return repo().update(sessionId, id, data)
}

export const deletePracticeCard = async (id: string, sessionId: string): Promise<void> => {
  return repo().delete(id, sessionId)
}
