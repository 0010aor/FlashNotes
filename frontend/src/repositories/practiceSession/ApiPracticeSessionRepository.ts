import { FlashcardsService } from '@/client'
import type { PracticeCardResponse, PracticeSession } from '@/client'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

export class ApiPracticeSessionRepository implements PracticeSessionRepository {
  async start(collectionId: string): Promise<PracticeSession> {
    return await FlashcardsService.startPracticeSession({
      requestBody: { collection_id: collectionId },
    })
  }

  async getNextCard(sessionId: string): Promise<PracticeCardResponse | null> {
    const response = await FlashcardsService.listPracticeCards({
      practiceSessionId: sessionId,
      status: 'pending',
      limit: 1,
    })
    const nextCardData = response.data?.[0]
    if (!nextCardData) return null
    return nextCardData
  }

  async submitCardResult(sessionId: string, cardId: string, isCorrect: boolean): Promise<void> {
    await FlashcardsService.updatePracticeCardResult({
      practiceSessionId: sessionId,
      cardId: cardId,
      requestBody: { is_correct: isCorrect },
    })
  }
}
