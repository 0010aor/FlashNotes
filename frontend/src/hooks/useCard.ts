import { FlashcardsService } from '@/client'
import { toaster } from '@/components/ui/toaster'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CardData {
  front: string
  back: string
  id?: string
}

const hasCardContentChanged = (originalCard: CardData, modifiedCard: CardData): boolean => {
  return modifiedCard.front !== originalCard.front || modifiedCard.back !== originalCard.back
}

export function useCard(collectionId: string, cardId?: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [card, setCard] = useState<CardData>({ front: '', back: '' })
  const [originalCard, setOriginalCard] = useState<CardData>({
    front: '',
    back: '',
  })

  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(!!cardId)

  useEffect(() => {
    if (!cardId) {
      setIsLoading(false)
      return
    }

    const fetchCard = async () => {
      try {
        const data = await FlashcardsService.readCard({ collectionId, cardId })
        setCard(data)
        setOriginalCard(data)
      } catch (error) {
        toaster.create({
          title: t('general.errors.errorloadingCard'),
          type: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCard()
  }, [cardId, collectionId, t])

  const saveCard = useCallback(
    async (cardData: CardData) => {
      if (cardData.front === '' && cardData.back === '') return

      const hasChanged = hasCardContentChanged(originalCard, cardData)

      if (!cardData.id || hasChanged) {
        try {
          let savedCard: CardData
          if (cardData.id) {
            savedCard = await FlashcardsService.updateCard({
              collectionId,
              cardId: cardData.id,
              requestBody: cardData,
            })
            setOriginalCard(cardData)
          } else {
            savedCard = await FlashcardsService.createCard({
              collectionId,
              requestBody: cardData,
            })
            setCard((prev) => ({ ...prev, id: savedCard.id }))
            setOriginalCard({ ...cardData, id: savedCard.id })
          }

          queryClient.invalidateQueries({
            queryKey: ['collections', collectionId, 'cards'],
          })
        } catch (error) {
          toaster.create({
            title: t('general.errors.errorSavingCard'),
            type: 'error',
          })
        }
      }
    },
    [originalCard, collectionId, queryClient, t],
  )

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev)
    setCurrentSide((side) => (side === 'front' ? 'back' : 'front'))
  }, [])

  return {
    card,
    isLoading,
    currentSide,
    isFlipped,
    saveCard,
    flip,
  }
}
