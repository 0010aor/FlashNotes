import { FlashcardsService } from '@/client'
import { isGuest } from '../../hooks/useAuth'
import * as cards from '../localDB/cards'

export const getCards = async (collectionId: string) => {
  if (isGuest()) {
    return await cards.getLocalCardsForCollection(collectionId)
  }
  const res = await FlashcardsService.readCards({ collectionId })
  return res.data
}

export const createCard = async (collectionId: string, data: { front: string; back: string }) => {
  if (isGuest()) {
    const id = (await cards.addLocalCard(collectionId, data.front, data.back)).id
    return await cards.getLocalCardById(id)
  }
  return await FlashcardsService.createCard({
    collectionId,
    requestBody: data,
  })
}

export const updateCard = async (
  collectionId: string,
  cardId: string,
  data: { front?: string; back?: string },
) => {
  if (isGuest()) {
    await cards.updateLocalCard(cardId, data)
    return await cards.getLocalCardById(cardId)
  }
  return await FlashcardsService.updateCard({
    collectionId,
    cardId,
    requestBody: data,
  })
}

export const deleteCard = async (collectionId: string, cardId: string) => {
  if (isGuest()) {
    return await cards.deleteLocalCard(cardId)
  }
  return await FlashcardsService.deleteCard({ collectionId, cardId })
}

export const getCardById = async (collectionId: string, cardId: string) => {
  if (isGuest()) {
    return await cards.getLocalCardById(cardId)
  }
  return await FlashcardsService.readCard({ collectionId, cardId })
}
