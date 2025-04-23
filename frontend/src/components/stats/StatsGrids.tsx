import type { CollectionStats } from '@/client/types.gen'
import { SimpleGrid } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import MasteryDonutChart from './MasteryDonutChart'
import MostFailedCards from './MostFailedCards'
import PerformanceChart from './PerformanceChart'
import PracticeBarChart from './PracticeBarChart'

interface StatsGridsProps {
  stats: CollectionStats
}

export default function StatsGrids({ stats }: StatsGridsProps) {
  const { t } = useTranslation()
  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
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
    </>
  )
}
