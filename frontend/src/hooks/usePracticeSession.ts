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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startingRef = useRef(false)

  const start = useCallback(async () => {
    if (startingRef.current || state.sessionId) return
    startingRef.current = true
    setIsLoading(true)
    setError(null)
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
    } catch (err: any) {
      setError(err.message || 'Failed to start session')
    } finally {
      setIsLoading(false)
      startingRef.current = false
    }
  }, [collectionId, state.sessionId])

  const handleFlip = useCallback(() => {
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))
  }, [])

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!state.sessionId || !state.currentCard) return
      setIsLoading(true)
      setError(null)
      try {
        await submitPracticeCardResult(state.sessionId, state.currentCard.id, isCorrect)
        const nextCardData = await getNextPracticeCard(state.sessionId)
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
            currentCard: nextCardData ? nextCardData.card : null,
            isFlipped: false,
          }
        })
      } catch (err: any) {
        setError(err.message || 'Failed to submit answer')
      } finally {
        setIsLoading(false)
      }
    },
    [state.sessionId, state.currentCard],
  )

  const reset = useCallback(async () => {
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
    setError(null)
    setIsLoading(true)
    try {
      await start()
    } finally {
      setIsLoading(false)
    }
  }, [start])

  return {
    ...state,
    isLoading,
    error,
    handleFlip,
    handleAnswer,
    reset,
    start,
  }
}
