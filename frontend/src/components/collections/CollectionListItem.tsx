import type { Collection } from '@/client'
import { Box, HStack, Text } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DefaultInput } from '../commonUI/Input'
import CollectionKebabMenu from './CollectionKebabMenu'

interface CollectionListItemProps {
  collection: Collection
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

function CollectionListItem({ collection, onDelete, onRename }: CollectionListItemProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(collection.name)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSubmit = () => {
    if (editedName.trim() !== collection.name) {
      onRename(collection.id, editedName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setEditedName(collection.name)
      setIsEditing(false)
    }
  }

  return (
    <HStack
      justifyContent="space-between"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="bg.100"
      _hover={{ bg: 'bg.50' }}
    >
      <Box
        as={isEditing ? 'div' : Link}
        {...(!isEditing && { to: `/collections/${collection.id}` })}
        p="1.25rem"
        flex="1"
        overflow="hidden"
      >
        <Box height="8">
          {isEditing ? (
            <DefaultInput
              autoFocus={true}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              size="sm"
              fontWeight="semibold"
            />
          ) : (
            <Text textStyle="md" fontWeight="semibold" color="fg.DEFAULT" truncate>
              {collection.name}
            </Text>
          )}
        </Box>
        <Text textStyle="xs" color="fg.muted" marginTop=".5rem">
          {collection.cards.length > 0
            ? `${t('general.words.totalCards')}: ${collection.cards.length}`
            : t('general.words.noCardsAdded')}
        </Text>
      </Box>
      <HStack p=".5rem" gap={1}>
        <CollectionKebabMenu
          collectionId={collection.id}
          onDelete={onDelete}
          onRename={handleEdit}
        />
      </HStack>
    </HStack>
  )
}

export default CollectionListItem
