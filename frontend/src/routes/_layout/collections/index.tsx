import { type CollectionCreate, FlashcardsService } from '@/client'
import AiCollectionDialog, {
  type AiCollectionDialogRef,
} from '@/components/collections/AiCollectionDialog'
import CollectionDialog, {
  type CollectionDialogRef,
} from '@/components/collections/CollectionDialog'
import CollectionListItem from '@/components/collections/CollectionListItem'
import EmptyState from '@/components/commonUI/EmptyState'
import ErrorState from '@/components/commonUI/ErrorState'
import ListSkeleton from '@/components/commonUI/ListSkeleton'
import ScrollableContainer from '@/components/commonUI/ScrollableContainer'
import SpeedDial, { type SpeedDialActionItem } from '@/components/commonUI/SpeedDial'
import { Stack, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VscAdd } from 'react-icons/vsc'

function getCollectionsQueryOptions() {
  return {
    queryFn: () => FlashcardsService.readCollections(),
    queryKey: ['collections'],
  }
}

export const Route = createFileRoute('/_layout/collections/')({
  component: Collections,
})

function Collections() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreatingAiCollection, setIsCreatingAiCollection] = useState(false)

  const addDialogRef = useRef<CollectionDialogRef>(null)
  const aiDialogRef = useRef<AiCollectionDialogRef>(null)

  const {
    data: collections,
    error,
    isLoading,
  } = useQuery({
    ...getCollectionsQueryOptions(),
    placeholderData: (prevData) => prevData,
  })

  const addCollection = async (collectionData: CollectionCreate) => {
    try {
      await FlashcardsService.createCollection({ requestBody: collectionData })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    }
  }

  const addAiCollection = async (prompt: string) => {
    try {
      setIsCreatingAiCollection(true)
      await FlashcardsService.createCollection({
        requestBody: { name: '', prompt: prompt },
      })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingAiCollection(false)
    }
  }

  const renameCollection = async (collectionId: string, newName: string) => {
    try {
      await FlashcardsService.updateCollection({
        collectionId: collectionId,
        requestBody: { name: newName },
      })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    }
  }

  const deleteCollection = async (collectionId: string) => {
    try {
      await FlashcardsService.deleteCollection({ collectionId })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) return <ListSkeleton count={5} />
  if (error) return <ErrorState error={error} />

  const speedDialActions: SpeedDialActionItem[] = [
    {
      id: 'add',
      icon: <VscAdd />,
      label: t('general.actions.addCollection'),
      onClick: () => addDialogRef.current?.open(),
    },
    {
      id: 'ai',
      icon: (
        <Text as="span" fontSize="sm" fontWeight="bold">
          AI
        </Text>
      ),
      label: t('general.actions.createAiCollection'),
      onClick: () => aiDialogRef.current?.open(),
      bgColor: 'fbuttons.orange',
    },
  ]

  return (
    <>
      <ScrollableContainer>
        <Stack gap={4} pt={14}>
          {collections?.data.length === 0 ? (
            <EmptyState
              title={t('routes.layout.index.readyToStartLearning')}
              message={t('routes.layout.index.createFirstCollection')}
            />
          ) : (
            collections?.data.map((collection) => (
              <CollectionListItem
                key={collection.id}
                collection={collection}
                onDelete={deleteCollection}
                onRename={renameCollection}
              />
            ))
          )}
        </Stack>
      </ScrollableContainer>

      <SpeedDial actions={speedDialActions} />

      <CollectionDialog ref={addDialogRef} onAdd={addCollection} />
      <AiCollectionDialog
        ref={aiDialogRef}
        onAddAi={addAiCollection}
        isLoading={isCreatingAiCollection}
      />
    </>
  )
}
