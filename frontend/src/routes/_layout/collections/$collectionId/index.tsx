import { FlashcardsService } from '@/client'
import CardListItem from '@/components/cards/CardIListtem'
import CollectionActionHeader from '@/components/collections/CollectionActionHeader'
import EmptyState from '@/components/commonUI/EmptyState'
import ErrorState from '@/components/commonUI/ErrorState'
import FloatingActionButton from '@/components/commonUI/FloatingActionButton'
import ListSkeleton from '@/components/commonUI/ListSkeleton'
import ScrollableContainer from '@/components/commonUI/ScrollableContainer'
import { Stack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MdSchool } from 'react-icons/md'
import { VscAdd } from 'react-icons/vsc'

function getCardsQueryOptions(collectionId: string) {
  return {
    queryFn: () => FlashcardsService.readCards({ collectionId }),
    queryKey: ['collections', collectionId, 'cards'],
  }
}

export const Route = createFileRoute('/_layout/collections/$collectionId/')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { collectionId } = Route.useParams()

  const { data, error, isLoading } = useQuery({
    ...getCardsQueryOptions(collectionId),
    placeholderData: (prevData) => prevData,
  })
  const cards = data?.data ?? []

  const deleteCard = async (cardId: string) => {
    try {
      await FlashcardsService.deleteCard({ collectionId, cardId })
      queryClient.invalidateQueries({
        queryKey: ['collections', collectionId, 'cards'],
      })
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) return <ListSkeleton />
  if (error) return <ErrorState error={error} />

  return (
    <>
      <CollectionActionHeader collectionId={collectionId} cardCount={cards.length} />

      <ScrollableContainer>
        <Stack gap="4">
          {cards.length === 0 ? (
            <EmptyState
              title={t('routes.layout.collectionIndex.collectionEmpty')}
              message={t('routes.layout.collectionIndex.addFirstCard')}
            />
          ) : (
            cards.map((card) => <CardListItem key={card.id} card={card} onDelete={deleteCard} />)
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

      <FloatingActionButton
        icon={<VscAdd color="white" />}
        position="right"
        aria-label={t('general.actions.addCard')}
        onClick={() => navigate({ to: `/collections/${collectionId}/cards/new` })}
      />
    </>
  )
}
