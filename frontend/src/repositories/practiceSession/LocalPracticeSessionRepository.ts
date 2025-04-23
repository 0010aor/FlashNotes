import type { PracticeSession } from '@/client'
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

  async getAll(collectionId: string): Promise<PracticeSession[]> {
    const locals = await practiceSessions.getLocalPracticeSessions(collectionId)
    return locals.map(toPracticeSession)
  }
}
