import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import type { CardBasicStats } from '@/client'

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

interface FailedCardData {
  id: string
  title: string
  failRate: number
  totalAttempts: number
  correctAnswers: number
}

interface MostFailedCardsProps {
  cards?: CardBasicStats[]
  title?: string
}

const MostFailedCards = ({ cards, title }: MostFailedCardsProps) => {
  const { t } = useTranslation()

  const chartData: FailedCardData[] =
    cards?.map((card) => {
      const failRate =
        card.total_attempts > 0
          ? 100 - Math.round((card.correct_answers / card.total_attempts) * 100)
          : 0
      return {
        id: card.id.toString(),
        title: stripHtml(card.front),
        failRate,
        totalAttempts: card.total_attempts,
        correctAnswers: card.correct_answers,
      }
    }) || []

  chartData.sort((a, b) => b.failRate - a.failRate)

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50" h="100%">
      <Heading size="md" mb={4}>
        {title || t('components.stats.mostFailedCards')}
      </Heading>

      <Stack gap={4} align="stretch">
        {chartData.map((card) => (
          <Box key={card.id}>
            <Flex justify="space-between" mb={1}>
              <Text
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                title={card.title}
              >
                {card.title}
              </Text>
              <Text fontWeight="bold" color="stat.negative">
                {card.failRate}%
              </Text>
            </Flex>
            <Flex justify="space-between" mb={1}>
              <Box
                w="100%"
                h="8px"
                borderRadius="full"
                bg="red.100"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  h="100%"
                  w={`${card.failRate}%`}
                  bg="stat.negative"
                  borderRadius="full"
                />
              </Box>
            </Flex>
            <Text fontSize="xs" color="gray.500">
              {t('components.stats.failedOutOfAttempts', {
                failed: card.totalAttempts - card.correctAnswers,
                total: card.totalAttempts,
              })}
            </Text>
            <Box h="2" />
          </Box>
        ))}
      </Stack>

      <Text fontSize="sm" mt={4} color="gray.500" textAlign="center">
        {t('components.stats.practiceTheseCards')}
      </Text>
    </Box>
  )
}

export default MostFailedCards
