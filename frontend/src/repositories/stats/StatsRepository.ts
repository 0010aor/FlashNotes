import type { CollectionStats } from '@/client/types.gen'

export interface StatsRepository {
  getCollectionStats(collectionId: string, limit?: number): Promise<CollectionStats>
}
