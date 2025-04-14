import { FlashcardsService } from '@/client'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'

interface PracticeSessionState {
  sessionId: string | null
  currentCard: {
    id: string
    front: string
    back: string
    collection_id: string
  } | null
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
  const startSession = useMutation({
    mutationFn: async () => {
      if (startingRef.current || state.sessionId) return null
      startingRef.current = true
      try {
        const session = await FlashcardsService.startPracticeSession({
          requestBody: { collection_id: collectionId },
        })
        return session
      } finally {
        startingRef.current = false
      }
    },
    onSuccess: (session) => {
      if (!session) return

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
        fetchNextPracticeCard.mutate(session.id)
      }
    },
  })

  const fetchNextPracticeCard = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await FlashcardsService.listPracticeCards({
        practiceSessionId: sessionId,
        status: 'pending',
        limit: 1,
      })
      return response
    },
    onSuccess: (response) => {
      const nextCardData = response.data?.[0]
      setState((prev) => ({
        ...prev,
        currentCard: nextCardData ? nextCardData.card : null,
        isFlipped: false,
      }))
    },
  })

  const submitResult = useMutation({
    mutationFn: async ({
      sessionId,
      cardId,
      isCorrect,
    }: { sessionId: string; cardId: string; isCorrect: boolean }) => {
      const response = await FlashcardsService.updatePracticeCardResult({
        practiceSessionId: sessionId,
        cardId,
        requestBody: { is_correct: isCorrect },
      })
      return response
    },
    onSuccess: (response) => {
      setState((prev) => {
        const newProgress = {
          ...prev.progress,
          correct: prev.progress.correct + (response.is_correct ? 1 : 0),
          incorrect: prev.progress.incorrect + (response.is_correct ? 0 : 1),
        }
        const isComplete = newProgress.correct + newProgress.incorrect >= prev.progress.total

        if (state.sessionId && !isComplete) {
          fetchNextPracticeCard.mutate(state.sessionId)
        }

        return {
          ...prev,
          progress: newProgress,
          isComplete,
        }
      })
    },
  })

  const handleFlip = useCallback(() => {
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))
  }, [])

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!state.sessionId || !state.currentCard) return

      submitResult.mutate({
        sessionId: state.sessionId,
        cardId: state.currentCard.id,
        isCorrect,
      })
    },
    [state.sessionId, state.currentCard, submitResult],
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
    startSession.mutate()
  }, [startSession])

  return {
    ...state,
    isLoading: startSession.isPending || fetchNextPracticeCard.isPending || submitResult.isPending,
    error: startSession.error || fetchNextPracticeCard.error || submitResult.error,
    handleFlip,
    handleAnswer,
    reset,
    start: startSession.mutate,
  }
}
