import { Box, Flex, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { CollectionBasicInfo, PracticeSessionStats } from '@/client'

interface SessionDataPoint {
  name: string
  value: number
  color: string
}

interface MasteryDonutChartProps {
  recentSessions: PracticeSessionStats[]
  collectionInfo: CollectionBasicInfo
  title?: string
}

const MasteryDonutChart = ({ recentSessions, collectionInfo, title }: MasteryDonutChartProps) => {
  const { t } = useTranslation()

  const showLegend = useBreakpointValue({ base: false, md: true })

  const latestSession = recentSessions.length > 0 ? recentSessions[recentSessions.length - 1] : null
  const totalCards = collectionInfo.total_cards

  let sessionBreakdownData: SessionDataPoint[] = []
  if (latestSession && totalCards > 0) {
    const correctCount = latestSession.correct_answers
    const incorrectCount = latestSession.cards_practiced - latestSession.correct_answers
    const notPracticedCount = Math.max(0, totalCards - latestSession.cards_practiced)

    sessionBreakdownData = [
      {
        name: t('components.stats.correct'),
        value: correctCount,
        color: 'var(--chakra-colors-stat-positive)',
      },
      {
        name: t('components.stats.incorrect'),
        value: incorrectCount,
        color: 'var(--chakra-colors-stat-negative)',
      },
      {
        name: t('components.stats.notPracticedInSession'),
        value: notPracticedCount,
        color: 'var(--chakra-colors-stat-neutral)',
      },
    ].filter((item) => item.value >= 0)
  } else if (totalCards > 0) {
    sessionBreakdownData = [
      {
        name: t('components.stats.notPracticedYet'),
        value: totalCards,
        color: 'var(--chakra-colors-stat-neutral)',
      },
    ]
  }

  if (sessionBreakdownData.length === 0) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50" h="100%">
        <Heading size="md" mb={4}>
          {title || t('components.stats.latestSessionBreakdown')}
        </Heading>
        <Flex align="center" justify="center" h="300px">
          <Text color="gray.500">{t('components.stats.noDataAvailable')}</Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50" h="100%">
      <Heading size="md" mb={4}>
        {title || t('components.stats.latestSessionBreakdown')}
      </Heading>
      <Flex direction="column" align="center" justify="center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sessionBreakdownData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
                const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

                return percent > 0.05 ? (
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight="bold"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null
              }}
            >
              {sessionBreakdownData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} cards`, name]}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--chakra-colors-gray-200)',
              }}
            />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const color = entry?.color
                  return <span style={{ color: color || '#000', fontWeight: 500 }}>{value}</span>
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <Text fontWeight="bold" fontSize="xl" mt={-4}>
          {totalCards} {t('general.words.cards')}
        </Text>
      </Flex>
    </Box>
  )
}

export default MasteryDonutChart
