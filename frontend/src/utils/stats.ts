import type { PracticeSessionStats } from '@/client'

export const calculateAverageAccuracy = (
  sessions: PracticeSessionStats[] | undefined,
): number | null => {
  if (!sessions || sessions.length === 0) return null

  const totalCorrect = sessions.reduce((sum, session) => sum + session.correct_answers, 0)
  const totalPracticed = sessions.reduce((sum, session) => sum + session.cards_practiced, 0)

  return totalPracticed > 0 ? Math.round((totalCorrect / totalPracticed) * 100) : null
}

export const calculateSessionSuccessRate = (
  session: PracticeSessionStats | null,
): number | null => {
  if (!session || session.cards_practiced === 0) return null
  return Math.round((session.correct_answers / session.cards_practiced) * 100)
}

export const calculateLearningTrend = (
  latestSession: PracticeSessionStats | null,
  previousSession: PracticeSessionStats | null,
): number | null => {
  const latestRate = calculateSessionSuccessRate(latestSession)
  const previousRate = calculateSessionSuccessRate(previousSession)

  if (latestRate === null || previousRate === null) return null
  return latestRate - previousRate
}
