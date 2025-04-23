import type { CollectionStats } from '@/client/types.gen'
import { getStatsRepository } from '@/repositories/stats/StatsRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getStatsRepository(isGuest())

export const getCollectionStats = async (
  collectionId: string,
  limit = 30,
): Promise<CollectionStats> => {
  return repo().getCollectionStats(collectionId, limit)
}
