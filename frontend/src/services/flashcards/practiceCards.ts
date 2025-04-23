import type { PracticeCard, PracticeCardResultPatch } from '@/client'
import { getPracticeCardRepository } from '@/repositories/practiceCard/PracticeCardRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getPracticeCardRepository(isGuest())

export const getPracticeCards = async (sessionId: string): Promise<PracticeCard[]> => {
  return repo().getAll(sessionId)
}

export const getPracticeCardById = async (id: string): Promise<PracticeCard | null> => {
  return repo().getById(id)
}

export const createPracticeCard = async (sessionId: string, data: any): Promise<PracticeCard> => {
  return repo().create(sessionId, data)
}

export const updatePracticeCard = async (
  id: string,
  data: PracticeCardResultPatch,
  practiceSessionId?: string,
): Promise<PracticeCard> => {
  return repo().update(id, data, practiceSessionId)
}

export const deletePracticeCard = async (id: string): Promise<void> => {
  return repo().delete(id)
}
