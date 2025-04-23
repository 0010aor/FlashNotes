import type { PracticeCardResponse, PracticeSession } from '@/client'
import * as practiceCards from '@/data/localDB/practiceCards'
import * as practiceSessions from '@/data/localDB/practiceSessions'
import type { LocalPracticeSession } from '@/db/flashcardsDB'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

function toPracticeSession(local: LocalPracticeSession): PracticeSession {
  return {
    id: local.id,
    collection_id: local.collectionId,
    user_id: '',
    is_completed: local.isCompleted,
    total_cards: local.totalCards,
    cards_practiced: local.cardsPracticed,
    correct_answers: local.correctAnswers,
    created_at: new Date(local.createdAt).toISOString(),
    updated_at: new Date(local.updatedAt).toISOString(),
    practice_cards: [],
  }
}

export class LocalPracticeSessionRepository implements PracticeSessionRepository {
  async start(collectionId: string): Promise<PracticeSession> {
    const local = await practiceSessions.startLocalPracticeSession(collectionId)
    return toPracticeSession(local)
  }

  async getNextCard(sessionId: string): Promise<PracticeCardResponse | null> {
    const localCard = await practiceCards.getNextLocalPracticeCard(sessionId)
    if (!localCard) return null
    return {
      card: {
        id: localCard.id,
        front: localCard.front,
        back: localCard.back,
        collection_id: localCard.collectionId,
      },
      is_practiced: false,
      is_correct: null,
    } as PracticeCardResponse
  }

  async submitCardResult(sessionId: string, cardId: string, isCorrect: boolean): Promise<void> {
    await practiceCards.updateLocalPracticeCardResult(sessionId, cardId, isCorrect)
  }
}
