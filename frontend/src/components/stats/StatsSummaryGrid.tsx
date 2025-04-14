import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import type { CollectionBasicInfo, PracticeSessionStats } from '@/client'
import { calculateAverageAccuracy, calculateLearningTrend } from '@/utils/stats'

interface StatCardProps {
  label: string
  value: string | number
  helpText?: string
  tooltip?: string
  valueColor?: string
}

const StatCard = ({ label, value, helpText, tooltip, valueColor }: StatCardProps) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.50">
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
        {value}
      </Text>
      {helpText && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {helpText}
        </Text>
      )}
      {tooltip && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {tooltip}
        </Text>
      )}
    </Box>
  )
}

interface StatsSummaryGridProps {
  collectionInfo: CollectionBasicInfo
  recentSessions: PracticeSessionStats[]
}

const StatsSummaryGrid = ({ collectionInfo, recentSessions }: StatsSummaryGridProps) => {
  const { t } = useTranslation()

  const latestSession = recentSessions.length > 0 ? recentSessions[0] : null
  const previousSession = recentSessions.length > 1 ? recentSessions[1] : null

  const averageAccuracy = calculateAverageAccuracy(recentSessions)
  const learningTrend = calculateLearningTrend(latestSession, previousSession)

  const formattedTrend =
    learningTrend !== null ? `${learningTrend > 0 ? '+' : ''}${learningTrend}%` : '-'

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
      <StatCard label={t('general.words.totalCards')} value={collectionInfo.total_cards} />
      <StatCard
        label={t('components.stats.practiceSessions')}
        value={collectionInfo.total_practice_sessions}
      />
      <StatCard
        label={t('components.stats.averageAccuracy')}
        value={averageAccuracy !== null ? `${averageAccuracy}%` : '-'}
        helpText={
          averageAccuracy !== null
            ? t('components.stats.allSessions')
            : t('components.stats.noRecentSessions')
        }
      />
      <StatCard
        label={t('components.stats.learningTrend')}
        value={formattedTrend}
        helpText={
          learningTrend !== null
            ? t('components.stats.comparedToPrevious')
            : t('components.stats.notEnoughData')
        }
        valueColor={
          learningTrend !== null
            ? learningTrend > 0
              ? 'green.500'
              : learningTrend < 0
                ? 'red.500'
                : undefined
            : undefined
        }
      />
    </SimpleGrid>
  )
}

export default StatsSummaryGrid
