import type { Collection, CollectionCreate, CollectionUpdate } from '@/client'
import * as collections from '@/data/localDB/collections'
import type { LocalCollection } from '@/db/flashcardsDB'
import type { CollectionRepository } from './CollectionRepository'

function toCollection(local: LocalCollection): Collection {
  return {
    id: local.id,
    name: local.name,
    user_id: '',
    cards: [],
  } as Collection
}

export class LocalCollectionRepository implements CollectionRepository {
  async getAll(): Promise<Collection[]> {
    const locals = await collections.getLocalCollections()
    return locals.map(toCollection)
  }

  async getById(id: string): Promise<Collection | null> {
    try {
      const local = await collections.getLocalCollectionById(id)
      return toCollection(local)
    } catch (e) {
      return null
    }
  }

  async create(data: CollectionCreate): Promise<Collection> {
    const local = await collections.addLocalCollection(data.name, data.prompt)
    return toCollection(local)
  }

  async update(id: string, data: CollectionUpdate): Promise<Collection> {
    const filteredData: Partial<Pick<LocalCollection, 'name'>> = {}
    if (typeof data.name !== 'undefined' && data.name !== null) filteredData.name = data.name
    await collections.updateLocalCollection(id, filteredData)
    const updated = await collections.getLocalCollectionById(id)
    return toCollection(updated)
  }

  async delete(id: string): Promise<void> {
    await collections.deleteLocalCollection(id)
  }
}
