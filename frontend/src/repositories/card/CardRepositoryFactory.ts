import { ApiCardRepository } from './ApiCardRepository'
import type { CardRepository } from './CardRepository'
import { LocalCardRepository } from './LocalCardRepository'

export function getCardRepository(isGuest: boolean): CardRepository {
  return isGuest ? new LocalCardRepository() : new ApiCardRepository()
}
