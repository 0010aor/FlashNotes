import { ApiCollectionRepository } from './ApiCollectionRepository'
import type { CollectionRepository } from './CollectionRepository'
import { LocalCollectionRepository } from './LocalCollectionRepository'

export function getCollectionRepository(isGuest: boolean): CollectionRepository {
  return isGuest ? new LocalCollectionRepository() : new ApiCollectionRepository()
}
