import type { PracticeSession } from '@/client'

export interface PracticeSessionRepository {
  start(collectionId: string): Promise<PracticeSession>
  getAll(collectionId: string): Promise<PracticeSession[]>
}
