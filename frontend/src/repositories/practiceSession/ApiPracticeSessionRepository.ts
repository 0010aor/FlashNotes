import { FlashcardsService } from '@/client'
import type { PracticeSession } from '@/client'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

export class ApiPracticeSessionRepository implements PracticeSessionRepository {
  async start(collectionId: string): Promise<PracticeSession> {
    return await FlashcardsService.startPracticeSession({
      requestBody: { collection_id: collectionId },
    })
  }

  async getAll(collectionId: string): Promise<PracticeSession[]> {
    const res = await FlashcardsService.listPracticeSessions()
    return res.data.filter((s) => s.collection_id === collectionId)
  }
}
