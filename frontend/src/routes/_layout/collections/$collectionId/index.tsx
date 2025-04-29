import type { Card } from '@/client/types.gen'
import CardListItem from '@/components/cards/CardIListtem'
import CollectionActionHeader from '@/components/collections/CollectionActionHeader'
import AiPromptDialog from '@/components/commonUI/AiPromptDialog'
import EmptyState from '@/components/commonUI/EmptyState'
import ErrorState from '@/components/commonUI/ErrorState'
import FloatingActionButton from '@/components/commonUI/FloatingActionButton'
import ListSkeleton from '@/components/commonUI/ListSkeleton'
import ScrollableContainer from '@/components/commonUI/ScrollableContainer'
import SpeedDial, { type SpeedDialActionItem } from '@/components/commonUI/SpeedDial'
import { createCard } from '@/services/cards'
import { deleteCard, getCards } from '@/services/cards'
import { isGuest } from '@/utils/authUtils'
import { Stack, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdSchool } from 'react-icons/md'
import { VscAdd } from 'react-icons/vsc'

export const Route = createFileRoute('/_layout/collections/$collectionId/')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { t } = useTranslation()
  const [isSpeedDialLoading, setIsSpeedDialLoading] = useState(false)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isCreatingAiCard, setIsCreatingAiCard] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { collectionId } = Route.useParams()

  const { data, error, isLoading } = useQuery<Card[]>({
    queryKey: ['collections', collectionId, 'cards'],
    queryFn: () => getCards(collectionId),
    placeholderData: (prevData) => prevData,
  })
  const cards = Array.isArray(data) ? data : []

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(collectionId, cardId)
      queryClient.invalidateQueries({
        queryKey: ['collections', collectionId, 'cards'],
      })
    } catch (error) {
      console.error(error)
    }
  }

  const addAiCard = async (prompt: string) => {
    if (!prompt) return
    try {
      setIsCreatingAiCard(true)
      setIsSpeedDialLoading(true)
      setIsAiDialogOpen(false)
      const savedCard = await createCard(collectionId, {
        front: '',
        back: '',
        prompt: prompt,
      })
      navigate({ to: `/collections/${collectionId}/cards/${savedCard.id}` })
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingAiCard(false)
      setIsSpeedDialLoading(false)
    }
  }

  if (isLoading) return <ListSkeleton />
  if (error) return <ErrorState error={error} />

  const speedDialActions: SpeedDialActionItem[] = [
    {
      id: 'add',
      icon: <VscAdd />,
      label: t('general.actions.addCard'),
      onClick: () => navigate({ to: `/collections/${collectionId}/cards/new` }),
    },
    {
      id: 'ai',
      icon: (
        <Text as="span" fontSize="sm" fontWeight="bold">
          AI
        </Text>
      ),
      label: t('general.actions.generateAiCard'),
      onClick: () => setIsAiDialogOpen(true),
      bgColor: 'fbuttons.orange',
      disabled: isGuest(),
    },
  ]

  return (
    <>
      <CollectionActionHeader
        collectionId={collectionId}
        cardCount={cards.length}
        onGenerateAICard={() => setIsAiDialogOpen(true)}
      />

      <ScrollableContainer>
        <Stack gap="4">
          {cards.length === 0 ? (
            <EmptyState
              title={t('routes.layout.collectionIndex.collectionEmpty')}
              message={t('routes.layout.collectionIndex.addFirstCard')}
            />
          ) : (
            cards.map((card: Card) => (
              <CardListItem key={card.id} card={card} onDelete={handleDeleteCard} />
            ))
          )}
        </Stack>
      </ScrollableContainer>

      {cards.length > 0 && (
        <FloatingActionButton
          icon={<MdSchool color="white" />}
          position="left"
          bgColor="fbuttons.green"
          aria-label={t('general.actions.practiceCards')}
          onClick={() => navigate({ to: `/collections/${collectionId}/practice` })}
        />
      )}

      <SpeedDial actions={speedDialActions} isLoading={isSpeedDialLoading} />

      <AiPromptDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        onSubmit={addAiCard}
        isLoading={isCreatingAiCard}
        title={t('components.AiCardDialog.title')}
        placeholder={t('components.AiCardDialog.placeholder')}
      />
    </>
  )
}
