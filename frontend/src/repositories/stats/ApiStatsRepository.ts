import { StatsService } from '@/client'
import type { CollectionStats } from '@/client/types.gen'
import type { StatsRepository } from './StatsRepository'

export class ApiStatsRepository implements StatsRepository {
  async getCollectionStats(collectionId: string, limit = 30): Promise<CollectionStats> {
    return StatsService.getCollectionStatisticsEndpoint({
      collectionId,
      limit,
    })
  }
}
