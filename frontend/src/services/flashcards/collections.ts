import type { Collection, CollectionCreate, CollectionUpdate } from '@/client'
import { getCollectionRepository } from '@/repositories/collection/CollectionRepositoryFactory'
import { isGuest } from '@/utils/authUtils'

const repo = () => getCollectionRepository(isGuest())

export const getCollections = async (): Promise<Collection[]> => {
  return repo().getAll()
}

export const getCollectionById = async (id: string): Promise<Collection | null> => {
  return repo().getById(id)
}

export const createCollection = async (data: CollectionCreate): Promise<Collection> => {
  return repo().create(data)
}

export const updateCollection = async (id: string, data: CollectionUpdate): Promise<Collection> => {
  return repo().update(id, data)
}

export const deleteCollection = async (id: string): Promise<void> => {
  return repo().delete(id)
}
