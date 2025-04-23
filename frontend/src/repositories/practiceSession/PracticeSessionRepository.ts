import type { PracticeCardResponse, PracticeSession } from '@/client'

export interface PracticeSessionRepository {
  start(collectionId: string): Promise<PracticeSession>
  getNextCard(sessionId: string): Promise<PracticeCardResponse | null>
  submitCardResult(sessionId: string, cardId: string, isCorrect: boolean): Promise<void>
}
