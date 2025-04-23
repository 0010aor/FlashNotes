import type { PracticeCard, PracticeCardResultPatch } from '@/client'

// The repository always returns the API PracticeCard type.
export interface PracticeCardRepository {
  getAll(sessionId: string): Promise<PracticeCard[]>
  getById(id: string): Promise<PracticeCard | null>
  create(sessionId: string, data: any): Promise<PracticeCard>
  update(
    id: string,
    data: PracticeCardResultPatch,
    practiceSessionId?: string,
  ): Promise<PracticeCard>
  delete(id: string): Promise<void>
}
