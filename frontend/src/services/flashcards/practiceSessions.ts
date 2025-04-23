import type { PracticeSession } from '@/client'
import { getPracticeSessionRepository } from '@/repositories/practiceSession/PracticeSessionRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getPracticeSessionRepository(isGuest())

export const startPracticeSession = async (collectionId: string): Promise<PracticeSession> => {
  return repo().start(collectionId)
}

export const getPracticeSessions = async (collectionId: string): Promise<PracticeSession[]> => {
  return repo().getAll(collectionId)
}
