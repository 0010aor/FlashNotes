import { Box, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { PracticeSessionStats } from '@/client'

interface PracticeData {
  label: string
  correct: number
  incorrect: number
}

interface PracticeBarChartProps {
  sessions?: PracticeSessionStats[]
  title?: string
}

const PracticeBarChart = ({ sessions, title }: PracticeBarChartProps) => {
  const { t, i18n } = useTranslation()
  const showAxisAndLegend = useBreakpointValue({ base: false, md: true })
  const chartData: PracticeData[] =
    sessions?.map((session, index) => {
      const dateStr = new Date(session.created_at).toLocaleDateString(i18n.language, {
        month: 'short',
        day: 'numeric',
      })
      return {
        label: `#${index + 1} (${dateStr})`,
        correct: session.correct_answers,
        incorrect: session.cards_practiced - session.correct_answers,
      }
    }) || []

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="bg.50" h="100%">
      <Heading size="md" mb={4}>
        {title || t('components.stats.recentPracticeSessions')}
      </Heading>
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
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
            {showAxisAndLegend && <YAxis tick={{ fill: 'var(--chakra-colors-stat-axis)' }} />}
            <Tooltip
              cursor={{ fill: 'var(--chakra-colors-bg-100)' }}
              formatter={(value, name) => [
                value,
                name === 'correct'
                  ? t('components.stats.correctAnswers')
                  : t('components.stats.incorrectAnswers'),
              ]}
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
            {showAxisAndLegend && (
              <Legend
                formatter={(value) => {
                  return value === 'correct'
                    ? t('components.stats.correctAnswers')
                    : t('components.stats.incorrectAnswers')
                }}
              />
            )}
            <ReferenceLine y={0} stroke="#000" />
            <Bar
              dataKey="correct"
              fill="var(--chakra-colors-stat-positive)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="incorrect"
              fill="var(--chakra-colors-stat-negative)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default PracticeBarChart
