import type { Card } from '@/client'
import { stripHtml } from '@/utils/text'
import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MdDelete } from 'react-icons/md'

interface CardListItemProps {
  card: Card
  onDelete: (id: string) => void
}

function CardListItem({ card, onDelete }: CardListItemProps) {
  const { t } = useTranslation()
  return (
    <HStack
      justifyContent="space-between"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="bg.100"
      _hover={{ bg: 'bg.50' }}
    >
      <Box p="1rem" flex="1" overflow="hidden" asChild>
        <Link
          to="/collections/$collectionId/cards/$cardId"
          params={{ collectionId: card.collection_id, cardId: card.id }}
        >
          <Text fontSize="md" color="fg.DEFAULT" truncate>
            {stripHtml(card.front)}
          </Text>
        </Link>
      </Box>
      <Box p=".75rem" borderLeft="1px" borderColor="bg.100">
        <IconButton
          aria-label={t('general.actions.deleteCard')}
          variant="ghost"
          size="sm"
          onClick={() => onDelete(card.id)}
          _hover={{
            bg: 'bg.100',
          }}
        >
          <MdDelete />
        </IconButton>
      </Box>
    </HStack>
  )
}

export default CardListItem
