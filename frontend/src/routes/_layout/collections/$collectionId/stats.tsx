import { StatsService } from '@/client'
import ErrorState from '@/components/commonUI/ErrorState'
import LoadingState from '@/components/commonUI/LoadingState'
import MasteryDonutChart from '@/components/stats/MasteryDonutChart'
import MostFailedCards from '@/components/stats/MostFailedCards'
import PerformanceChart from '@/components/stats/PerformanceChart'
import PracticeBarChart from '@/components/stats/PracticeBarChart'
import StatsSummaryGrid from '@/components/stats/StatsSummaryGrid'
import { Container, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_layout/collections/$collectionId/stats')({
  component: StatsPage,
})

function StatsPage() {
  const { t } = useTranslation()
  const { collectionId } = Route.useParams()

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collectionStats', collectionId, 7],
    queryFn: () =>
      StatsService.getCollectionStatisticsEndpoint({
        collectionId,
        days: 7,
      }),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!stats) return <ErrorState error={new Error(t('general.errors.collectionNotFound'))} />

  return (
    <Container maxW="container.xl" py={6}>
      <Stack gap={6}>
        <Heading>
          {stats.collection_info.name || 'Collection'} - {t('general.words.statistics')}
        </Heading>

        <StatsSummaryGrid
          collectionInfo={stats.collection_info}
          recentSessions={stats.recent_sessions}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <PracticeBarChart sessions={stats.recent_sessions} />
          <PerformanceChart sessions={stats.recent_sessions} />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <MasteryDonutChart
            recentSessions={stats.recent_sessions}
            collectionInfo={stats.collection_info}
            title={t('components.stats.latestSessionBreakdown')}
          />
          <MostFailedCards cards={stats.difficult_cards} />
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
