import { Box, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { PracticeSessionStats } from '@/client'

interface PerformanceData {
  label: string
  correctRate: number
  cardsPracticed: number
}

interface PerformanceChartProps {
  sessions?: PracticeSessionStats[]
  title?: string
}

const PerformanceChart = ({ sessions, title }: PerformanceChartProps) => {
  const { t, i18n } = useTranslation()

  const showAxisAndLegend = useBreakpointValue({ base: false, md: true })

  const chartData: PerformanceData[] =
    sessions?.map((session, index) => {
      const correctRate =
        session.cards_practiced > 0
          ? Math.round((session.correct_answers / session.cards_practiced) * 100)
          : 0
      const dateStr = new Date(session.created_at).toLocaleDateString(i18n.language, {
        month: 'short',
        day: 'numeric',
      })
      return {
        label: `#${index + 1} (${dateStr})`,
        correctRate: correctRate,
        cardsPracticed: session.cards_practiced,
      }
    }) || []

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50" h="100%">
      <Heading size="md" mb={4}>
        {title || t('components.stats.performanceOverTime')}
      </Heading>
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {showAxisAndLegend && (
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--chakra-colors-stat-axis)', fontSize: 12 }}
                tickFormatter={(_value, index) => `#${index + 1}`}
              />
            )}
            {showAxisAndLegend && (
              <YAxis
                yAxisId="left"
                tick={{ fill: 'var(--chakra-colors-stat-axis)' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
            )}
            {showAxisAndLegend && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'var(--chakra-colors-stat-axis)' }}
                allowDecimals={false}
              />
            )}
            <Tooltip
              formatter={(value, name) => {
                if (name === 'correctRate') {
                  return [`${value}%`, t('components.stats.correctRate')]
                }
                if (name === 'cardsPracticed') {
                  return [value, t('components.stats.cardsPracticed')]
                }
                return [value, name]
              }}
              labelFormatter={(label) => {
                return (
                  <Text color="fg.muted" fontWeight="semibold">
                    {label}
                  </Text>
                )
              }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--chakra-colors-gray-200)',
              }}
            />
            {showAxisAndLegend && <Legend />}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="correctRate"
              stroke="var(--chakra-colors-stat-neutral)"
              strokeWidth={3}
              dot={{
                strokeWidth: 2,
                r: 4,
                fill: 'var(--chakra-colors-stat-neutral)',
              }}
              activeDot={{ r: 8, fill: 'var(--chakra-colors-stat-neutral)' }}
              name={t('components.stats.correctRate')}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cardsPracticed"
              stroke="#4299E1"
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4, fill: '#4299E1' }}
              name={t('components.stats.cardsPracticed')}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default PerformanceChart
