import type { Collection, CollectionCreate, CollectionUpdate } from '@/client'

export interface CollectionRepository {
  getAll(): Promise<Collection[]>
  getById(id: string): Promise<Collection | null>
  create(data: CollectionCreate): Promise<Collection>
  update(id: string, data: CollectionUpdate): Promise<Collection>
  delete(id: string): Promise<void>
}
