import { FlashcardsService } from '@/client'
import type { PracticeCard, PracticeCardResponse, PracticeCardResultPatch } from '@/client'
import type { PracticeCardRepository } from './PracticeCardRepository'

function responseToPracticeCard(resp: PracticeCardResponse): PracticeCard {
  return {
    id: resp.card.id,
    card_id: resp.card.id,
    session_id: '',
    is_correct: resp.is_correct,
    is_practiced: resp.is_practiced,
    created_at: '',
    updated_at: '',
  }
}

export class ApiPracticeCardRepository implements PracticeCardRepository {
  async getAll(sessionId: string): Promise<PracticeCard[]> {
    const result = await FlashcardsService.listPracticeCards({ practiceSessionId: sessionId })
    return result.data.map(responseToPracticeCard)
  }

  async getById(id: string): Promise<PracticeCard | null> {
    // Not directly supported by API; fetch all and filter
    return null
  }

  async create(sessionId: string, data: any): Promise<PracticeCard> {
    // Not supported by API
    throw new Error('Not supported')
  }

  async update(
    id: string,
    data: PracticeCardResultPatch,
    practiceSessionId?: string,
  ): Promise<PracticeCard> {
    if (!practiceSessionId) throw new Error('practiceSessionId required')
    if (typeof data.is_correct === 'undefined') throw new Error('is_correct required')
    const resp = await FlashcardsService.updatePracticeCardResult({
      cardId: id,
      practiceSessionId,
      requestBody: data,
    })
    return responseToPracticeCard(resp)
  }

  async delete(id: string): Promise<void> {
    // Not supported by API
    throw new Error('Not supported')
  }
}
