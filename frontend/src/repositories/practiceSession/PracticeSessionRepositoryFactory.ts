import { ApiPracticeSessionRepository } from './ApiPracticeSessionRepository'
import { LocalPracticeSessionRepository } from './LocalPracticeSessionRepository'
import type { PracticeSessionRepository } from './PracticeSessionRepository'

export function getPracticeSessionRepository(isGuest: boolean): PracticeSessionRepository {
  return isGuest ? new LocalPracticeSessionRepository() : new ApiPracticeSessionRepository()
}
