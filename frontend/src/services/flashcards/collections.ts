import { FlashcardsService } from '@/client'
const isGuest = () => localStorage.getItem('guest_mode') === 'true'
import * as cards from '../localDB/cards'
import * as collections from '../localDB/collections'

export const getCollections = async () => {
  if (isGuest()) {
    const localCollections = await collections.getLocalCollections()
    if (localCollections.length === 0) return []

    const collectionIds = localCollections.map((col) => col.id)
    const allCards = await cards.getLocalCardsForCollections(collectionIds)

    const cardsByCollection: Record<string, typeof allCards> = {}
    for (const card of allCards) {
      if (!cardsByCollection[card.collectionId]) cardsByCollection[card.collectionId] = []
      cardsByCollection[card.collectionId].push(card)
    }

    const collectionsWithCards = localCollections.map((col) => ({
      ...col,
      cards: cardsByCollection[col.id] || [],
    }))
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
