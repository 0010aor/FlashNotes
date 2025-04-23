import type { PracticeCardResponse, PracticeSession } from '@/client'
import * as practiceCards from '@/data/localDB/practiceCards'
import * as practiceSessions from '@/data/localDB/practiceSessions'
import type { LocalPracticeCard, LocalPracticeSession } from '@/db/flashcardsDB'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

function toPracticeSession(
  local: LocalPracticeSession,
  practiceCardsList: LocalPracticeCard[],
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
    practice_cards: practiceCardsList.map((card) => ({
      card_id: card.cardId,
      id: card.id,
      session_id: card.sessionId,
      created_at: '',
      updated_at: '',
      is_practiced: card.isPracticed ?? false,
      is_correct: card.isCorrect ?? null,
    })),
  }
}

export class LocalPracticeSessionRepository implements PracticeSessionRepository {
  async start(collectionId: string): Promise<PracticeSession> {
    const local = await practiceSessions.startLocalPracticeSession(collectionId)
    const practiceCardsList = await this.getPracticeCardsForSession(local.id)
    return toPracticeSession(local, practiceCardsList)
  }

  async getPracticeCardsForSession(sessionId: string): Promise<LocalPracticeCard[]> {
    return await practiceCards.getLocalPracticeCardsForSession(sessionId)
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
      is_practiced: localCard.isPracticed,
      is_correct: localCard.isCorrect,
    } as PracticeCardResponse
  }

  async submitCardResult(sessionId: string, cardId: string, isCorrect: boolean): Promise<void> {
    await practiceCards.updateLocalPracticeCard(sessionId, cardId, isCorrect)
  }
}
