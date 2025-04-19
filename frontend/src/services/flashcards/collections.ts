import { FlashcardsService } from '@/client'
import { isGuest } from '../../hooks/useAuth'
import * as cards from '../localDB/cards'
import * as collections from '../localDB/collections'

export const getCollections = async () => {
  if (isGuest()) {
    const localCollections = await collections.getLocalCollections()
    const collectionsWithCards = await Promise.all(
      localCollections.map(async (col) => ({
        ...col,
        cards: await cards.getLocalCardsForCollection(col.id),
      })),
    )
    return collectionsWithCards
  }
  const res = await FlashcardsService.readCollections()
  return res.data
}

export const createCollection = async (data: { name: string; prompt?: string | null }) => {
  if (isGuest()) {
    return await collections.addLocalCollection(data.name, data.prompt)
  }
  return await FlashcardsService.createCollection({ requestBody: data })
}

export const updateCollection = async (
  id: string,
  data: { name?: string; prompt?: string | null },
) => {
  if (isGuest()) {
    return await collections.updateLocalCollection(id, data)
  }
  return await FlashcardsService.updateCollection({
    collectionId: id,
    requestBody: data,
  })
}

export const deleteCollection = async (id: string) => {
  if (isGuest()) {
    return await collections.deleteLocalCollection(id)
  }
  return await FlashcardsService.deleteCollection({ collectionId: id })
}
