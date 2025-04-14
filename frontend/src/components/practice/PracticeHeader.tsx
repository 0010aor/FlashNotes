import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RiEdit2Fill } from 'react-icons/ri'

interface Progress {
  correct: number
  incorrect: number
  total: number
}

interface PracticeHeaderProps {
  cardId: string
  progress: Progress
  collectionId: string
}

function PracticeHeader({ cardId, progress, collectionId }: PracticeHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const total = progress.total

  return (
    <VStack w="100%" gap={2} align="stretch">
      <HStack w="100%" justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="fg.muted">
          {total === 0
            ? `${t('general.actions.startPracticing')}!`
            : `${t('general.words.correct')}: ${progress.correct} | ${t('general.words.incorrect')}: ${progress.incorrect}`}
        </Text>
        <IconButton
          aria-label="Edit card"
          size="sm"
          variant="ghost"
          onClick={() =>
            navigate({
              to: `/collections/${collectionId}/cards/${cardId}`,
            })
          }
          _hover={{
            transform: 'scale(1.05)',
            bg: 'bg.50',
          }}
        >
          <RiEdit2Fill />
        </IconButton>
      </HStack>
      {total > 0 && (
        <Box w="100%" h="2" bg="bg.50" borderRadius="full" overflow="hidden">
          <Box
            h="100%"
            w={`${((progress.correct + progress.incorrect) * 100) / total}%`}
            bg="bg.200"
            borderRadius="full"
            transition="width 0.3s ease-in-out"
          />
        </Box>
      )}
    </VStack>
  )
}

export default PracticeHeader
