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

export function calculateLearningTrend(
  sessions: PracticeSessionStats[] | undefined,
): number | null {
  if (!sessions || sessions.length < 2) return null
  const firstRate = calculateSessionSuccessRate(sessions[0])
  const lastRate = calculateSessionSuccessRate(sessions[sessions.length - 1])
  if (firstRate === null || lastRate === null) return null
  return lastRate - firstRate
}
