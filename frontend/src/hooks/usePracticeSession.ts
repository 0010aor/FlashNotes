import type { PracticeCardResponse } from '@/client'
import {
  getNextPracticeCard,
  startPracticeSession,
  submitPracticeCardResult,
} from '@/services/practiceSessions'
import { useCallback, useRef, useState } from 'react'

interface PracticeSessionState {
  sessionId: string | null
  currentCard: PracticeCardResponse['card'] | null
  isFlipped: boolean
  progress: {
    correct: number
    incorrect: number
    total: number
  }
  isComplete: boolean
}

export function usePracticeSession(collectionId: string) {
  const [state, setState] = useState<PracticeSessionState>({
    sessionId: null,
    currentCard: null,
    isFlipped: false,
    progress: {
      correct: 0,
      incorrect: 0,
      total: 0,
    },
    isComplete: false,
  })

  const startingRef = useRef(false)

  const start = useCallback(async () => {
    if (startingRef.current || state.sessionId) return
    startingRef.current = true
    try {
      const session = await startPracticeSession(collectionId)
      setState((prev) => ({
        ...prev,
        sessionId: session.id,
        isComplete: session.is_completed,
        progress: {
          correct: session.correct_answers,
          incorrect: session.cards_practiced - session.correct_answers,
          total: session.total_cards,
        },
      }))
      if (!session.is_completed) {
        const nextCardData = await getNextPracticeCard(session.id)
        setState((prev) => ({
          ...prev,
          currentCard: nextCardData ? nextCardData.card : null,
          isFlipped: false,
        }))
      }
    } finally {
      startingRef.current = false
    }
  }, [collectionId, state.sessionId])

  const handleFlip = useCallback(() => {
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))
  }, [])

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!state.sessionId || !state.currentCard) return
      await submitPracticeCardResult(state.sessionId, state.currentCard.id, isCorrect)
      setState((prev) => {
        const newProgress = {
          ...prev.progress,
          correct: prev.progress.correct + (isCorrect ? 1 : 0),
          incorrect: prev.progress.incorrect + (isCorrect ? 0 : 1),
        }
        const isComplete = newProgress.correct + newProgress.incorrect >= prev.progress.total
        return {
          ...prev,
          progress: newProgress,
          isComplete,
        }
      })
      if (state.sessionId) {
        const nextCardData = await getNextPracticeCard(state.sessionId)
        setState((prev) => ({
          ...prev,
          currentCard: nextCardData ? nextCardData.card : null,
          isFlipped: false,
        }))
      }
    },
    [state.sessionId, state.currentCard],
  )

  const reset = useCallback(() => {
    setState({
      sessionId: null,
      currentCard: null,
      isFlipped: false,
      progress: {
        correct: 0,
        incorrect: 0,
        total: 0,
      },
      isComplete: false,
    })
    start()
  }, [start])

  return {
    ...state,
    isLoading: false,
    error: null,
    handleFlip,
    handleAnswer,
    reset,
    start,
  }
}
