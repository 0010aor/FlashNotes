import type { PracticeCardResponse, PracticeSession } from '@/client'
import { getPracticeSessionRepository } from '@/repositories/practiceSession/PracticeSessionRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getPracticeSessionRepository(isGuest())

export const startPracticeSession = async (collectionId: string): Promise<PracticeSession> => {
  return repo().start(collectionId)
}

export const getNextPracticeCard = async (
  sessionId: string,
): Promise<PracticeCardResponse | null> => {
  return repo().getNextCard(sessionId)
}

export const submitPracticeCardResult = async (
  sessionId: string,
  cardId: string,
  isCorrect: boolean,
): Promise<void> => {
  await repo().submitCardResult(sessionId, cardId, isCorrect)
}
