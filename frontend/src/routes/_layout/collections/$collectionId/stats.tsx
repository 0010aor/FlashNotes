import type { CollectionStats } from '@/client/types.gen'
import ErrorState from '@/components/commonUI/ErrorState'
import LoadingState from '@/components/commonUI/LoadingState'
import StatsGrids from '@/components/stats/StatsGrids'
import StatsSummaryGrid from '@/components/stats/StatsSummaryGrid'
import { getCollectionStats } from '@/services/stats'
import { isGuest } from '@/utils/authUtils'
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
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
  } = useQuery<CollectionStats>({
    queryKey: ['collectionStats', collectionId, 30],
    queryFn: () => getCollectionStats(collectionId, 30),
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

        {isGuest() ? (
          <Box position="relative">
            <Box
              style={{
                filter: 'blur(6px)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <StatsGrids stats={stats} />
            </Box>
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={1}
              bg="bg.100"
              opacity={0.85}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="bg.200"
            >
              <Text fontWeight="bold" color="fg.DEFAULT" fontSize="lg" textAlign="center" px={4}>
                {t('components.stats.guestStatsBlur')}
              </Text>
            </Box>
          </Box>
        ) : (
          <StatsGrids stats={stats} />
        )}
      </Stack>
    </Container>
  )
}
