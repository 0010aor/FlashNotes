import { isGuest } from '@/utils/authUtils'
import { ApiStatsRepository } from './ApiStatsRepository'
import { LocalStatsRepository } from './LocalStatsRepository'
import type { StatsRepository } from './StatsRepository'

export function getStatsRepository(): StatsRepository {
  return isGuest() ? new LocalStatsRepository() : new ApiStatsRepository()
}
