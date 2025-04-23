import { FlashcardsService } from '@/client'
import type { Collection, CollectionCreate, CollectionList, CollectionUpdate } from '@/client'
import type { CollectionRepository } from './CollectionRepository'

export class ApiCollectionRepository implements CollectionRepository {
  async getAll(): Promise<Collection[]> {
    const result: CollectionList = await FlashcardsService.readCollections()
    return result.data
  }

  async getById(id: string): Promise<Collection | null> {
    try {
      return await FlashcardsService.readCollection({ collectionId: id })
    } catch (e) {
      return null
    }
  }

  async create(data: CollectionCreate): Promise<Collection> {
    return FlashcardsService.createCollection({ requestBody: data })
  }

  async update(id: string, data: CollectionUpdate): Promise<Collection> {
    return FlashcardsService.updateCollection({ collectionId: id, requestBody: data })
  }

  async delete(id: string): Promise<void> {
    await FlashcardsService.deleteCollection({ collectionId: id })
  }
}
