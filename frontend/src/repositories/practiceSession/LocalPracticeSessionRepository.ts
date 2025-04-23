import type { PracticeCardResponse, PracticeSession } from '@/client'
import * as practiceSessions from '@/data/localDB/practiceSessions'
import type { LocalPracticeSession } from '@/db/flashcardsDB'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

function toPracticeSession(
  local: LocalPracticeSession,
  practiceCardsList: PracticeCardResponse[],
): PracticeSession {
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
    practice_cards: practiceCardsList.map((c) => ({
      card_id: c.card.id,
      id: c.card.id,
      session_id: local.id,
      created_at: '',
      updated_at: '',
      is_practiced: c.is_practiced,
      is_correct: c.is_correct,
    })),
  }
}

export class LocalPracticeSessionRepository implements PracticeSessionRepository {
  async start(collectionId: string): Promise<PracticeSession> {
    const local = await practiceSessions.startLocalPracticeSession(collectionId)
    const practiceCardsList = await this.getPracticeCardsForSession(local.id)
    return toPracticeSession(local, practiceCardsList)
  }

  async getPracticeCardsForSession(sessionId: string): Promise<PracticeCardResponse[]> {
    return await practiceSessions.getPracticeCardsForSession(sessionId)
  }

  async getNextCard(sessionId: string): Promise<PracticeCardResponse | null> {
    return await practiceSessions.getNextLocalPracticeCard(sessionId)
  }

  async submitCardResult(sessionId: string, cardId: string, isCorrect: boolean): Promise<void> {
    await practiceSessions.submitCardResult(sessionId, cardId, isCorrect)
  }
}
