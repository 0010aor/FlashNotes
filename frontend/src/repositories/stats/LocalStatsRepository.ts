import type { CollectionStats } from '@/client/types.gen'
import { getLocalCollectionStats } from '@/data/localDB/stats'
import type { StatsRepository } from './StatsRepository'

export class LocalStatsRepository implements StatsRepository {
  async getCollectionStats(collectionId: string, _limit = 30): Promise<CollectionStats> {
    return getLocalCollectionStats(collectionId)
  }
}
