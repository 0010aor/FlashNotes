import { ApiPracticeCardRepository } from './ApiPracticeCardRepository'
import { LocalPracticeCardRepository } from './LocalPracticeCardRepository'
import type { PracticeCardRepository } from './PracticeCardRepository'

export function getPracticeCardRepository(isGuest: boolean): PracticeCardRepository {
  return isGuest ? new LocalPracticeCardRepository() : new ApiPracticeCardRepository()
}
