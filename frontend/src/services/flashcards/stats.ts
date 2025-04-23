import type { CollectionStats } from '@/client/types.gen'
import { getStatsRepository } from '@/repositories/stats/StatsRepositoryFactory'

export const getCollectionStats = async (
  collectionId: string,
  limit = 30,
): Promise<CollectionStats> => {
  return getStatsRepository().getCollectionStats(collectionId, limit)
}
