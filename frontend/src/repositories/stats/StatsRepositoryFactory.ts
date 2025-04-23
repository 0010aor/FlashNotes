import { ApiStatsRepository } from './ApiStatsRepository'
import { LocalStatsRepository } from './LocalStatsRepository'
import type { StatsRepository } from './StatsRepository'

export function getStatsRepository(isGuest: boolean): StatsRepository {
  return isGuest ? new LocalStatsRepository() : new ApiStatsRepository()
}
