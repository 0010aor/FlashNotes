import type { PracticeCard, PracticeCardResultPatch } from '@/client'
import * as practiceCards from '@/data/localDB/practiceCards'
import type { LocalPracticeCard } from '@/db/flashcardsDB'
import type { PracticeCardRepository } from './PracticeCardRepository'

function toPracticeCard(local: LocalPracticeCard): PracticeCard {
  return {
    id: local.id,
    card_id: local.cardId,
    session_id: local.sessionId,
    is_correct: typeof local.isCorrect === 'undefined' ? null : local.isCorrect,
    is_practiced: local.isPracticed,
    created_at: '',
    updated_at: '',
  } as PracticeCard
}

export class LocalPracticeCardRepository implements PracticeCardRepository {
  async getAll(sessionId: string): Promise<PracticeCard[]> {
    const locals = await practiceCards.getLocalPracticeCardsForSession(sessionId)
    return locals.map(toPracticeCard)
  }

  async getById(id: string): Promise<PracticeCard | null> {
    try {
      const local = await practiceCards.getLocalPracticeCardById(id)
      return toPracticeCard(local)
    } catch (e) {
      return null
    }
  }

  async create(sessionId: string, data: any): Promise<PracticeCard> {
    // Not typically created directly; implement if needed
    throw new Error('Not supported')
  }

  async update(
    id: string,
    data: PracticeCardResultPatch,
    _practiceSessionId?: string,
  ): Promise<PracticeCard> {
    const updateData: Partial<LocalPracticeCard> = {}
    if (typeof data.is_correct !== 'undefined') updateData.isCorrect = data.is_correct
    await practiceCards.updateLocalPracticeCard(id, updateData)
    const updated = await practiceCards.getLocalPracticeCardById(id)
    return toPracticeCard(updated)
  }

  async delete(id: string): Promise<void> {
    await practiceCards.deleteLocalPracticeCard(id)
  }
}
