import { FlashcardsService } from '@/client'
import ErrorState from '@/components/commonUI/ErrorState'
import LoadingState from '@/components/commonUI/LoadingState'
import { Box, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
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
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => FlashcardsService.readCollection({ collectionId }),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!collection) return <ErrorState error={new Error(t('general.errors.collectionNotFound'))} />

  return (
    <Container maxW="container.xl" py={6}>
      <Stack gap={6}>
        <Heading>
          {collection.name} - {t('general.words.statistics')}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Basic Info Section */}
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50">
            <Stack gap={4}>
              <Heading size="md">{t('routes.layout.stats.basicInfo')}</Heading>
              <Text>
                {t('general.words.totalCards')}: {collection.cards?.length || 0}
              </Text>
            </Stack>
          </Box>

          {/* Study Progress Section */}
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50">
            <Stack gap={4}>
              <Heading size="md">{t('routes.layout.stats.studyProgress')}</Heading>
              <Text>
                {t('routes.layout.stats.cardsMastered')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('routes.layout.stats.cardsInProgress')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('routes.layout.stats.cardsToReview')}: {t('general.actions.commingSoon')}
              </Text>
            </Stack>
          </Box>

          {/* Difficulty Distribution Section */}
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50">
            <Stack gap={4}>
              <Heading size="md">{t('routes.layout.stats.difficultyDistribution')}</Heading>
              <Text>
                {t('general.words.easy')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('general.words.medium')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('general.words.hard')}: {t('general.actions.commingSoon')}
              </Text>
            </Stack>
          </Box>

          {/* Practice Statistics Section */}
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50">
            <Stack gap={4}>
              <Heading size="md">{t('routes.layout.stats.practiceStatistics')}</Heading>
              <Text>
                {t('routes.layout.stats.totalPracticeSessions')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('routes.layout.stats.averageScore')}: {t('general.actions.commingSoon')}
              </Text>
              <Text>
                {t('routes.layout.stats.successRate')}: {t('general.actions.commingSoon')}
              </Text>
            </Stack>
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
