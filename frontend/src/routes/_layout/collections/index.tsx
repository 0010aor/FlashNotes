import type { Collection } from '@/client/types.gen'
import CollectionDialog from '@/components/collections/CollectionDialog'
import CollectionListItem from '@/components/collections/CollectionListItem'
import AiPromptDialog from '@/components/commonUI/AiPromptDialog'
import EmptyState from '@/components/commonUI/EmptyState'
import ErrorState from '@/components/commonUI/ErrorState'
import ListSkeleton from '@/components/commonUI/ListSkeleton'
import ScrollableContainer from '@/components/commonUI/ScrollableContainer'
import SpeedDial, { type SpeedDialActionItem } from '@/components/commonUI/SpeedDial'
import {
  createCollection,
  deleteCollection as deleteCollectionApi,
  getCollections,
  updateCollection,
} from '@/services/collections'
import { Stack, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VscAdd } from 'react-icons/vsc'
import { isGuest } from '../../../utils/authUtils'

export const Route = createFileRoute('/_layout/collections/')({
  component: Collections,
})

function Collections() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreatingAiCollection, setIsCreatingAiCollection] = useState(false)
  const [isSpeedDialLoading, setIsSpeedDialLoading] = useState(false)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data, error, isLoading } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: getCollections,
    placeholderData: (prevData) => prevData,
  })

  const collectionList: Collection[] = data || []

  const addCollection = async (name: string) => {
    if (!name) return
    try {
      setIsAddDialogOpen(false)
      await createCollection({ name })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    }
  }

  const addAiCollection = async (prompt: string) => {
    if (!prompt) return
    try {
      setIsCreatingAiCollection(true)
      setIsSpeedDialLoading(true)
      setIsAiDialogOpen(false)
      await createCollection({ name: '', prompt })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingAiCollection(false)
      setIsSpeedDialLoading(false)
    }
  }

  const renameCollection = async (collectionId: string, newName: string) => {
    try {
      await updateCollection(collectionId, { name: newName })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollectionApi(collectionId)
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
      onClick: () => setIsAddDialogOpen(true),
    },
    {
      id: 'ai',
      icon: (
        <Text as="span" fontSize="sm" fontWeight="bold">
          AI
        </Text>
      ),
      label: t('general.actions.createAiCollection'),
      onClick: () => setIsAiDialogOpen(true),
      bgColor: 'fbuttons.orange',
      disabled: isGuest(),
    },
  ]

  return (
    <>
      <ScrollableContainer>
        <Stack gap={4} pt={14}>
          {collectionList.length === 0 ? (
            <EmptyState
              title={t('routes.layout.index.readyToStartLearning')}
              message={t('routes.layout.index.createFirstCollection')}
            />
          ) : (
            collectionList.map((collection: Collection) => (
              <CollectionListItem
                key={collection.id}
                collection={collection}
                onDelete={handleDeleteCollection}
                onRename={renameCollection}
              />
            ))
          )}
        </Stack>
      </ScrollableContainer>

      <SpeedDial actions={speedDialActions} isLoading={isSpeedDialLoading} />

      <CollectionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={addCollection}
      />
      <AiPromptDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        onSubmit={addAiCollection}
        isLoading={isCreatingAiCollection}
        title={t('components.AiCollectionDialog.title')}
        placeholder={t('components.AiCollectionDialog.placeholder')}
      />
    </>
  )
}
