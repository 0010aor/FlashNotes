import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { PracticeCardListResponse, PracticeSession } from '../client/types.gen'
import type { LocalCard, LocalPracticeSession } from '../db/flashcardsDB'
import { listPracticeCards, updatePracticeCardResult } from '../services/flashcards/practiceCards'
import { startPracticeSession } from '../services/flashcards/practiceSessions'
import {
  getNextLocalPracticeCard,
  updateLocalPracticeCardResult,
} from '../services/localDB/practiceCards'
import * as practiceSessions from '../services/localDB/practiceSessions'
import { isGuest } from '../utils/authUtils'

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

type SessionType = PracticeSession | LocalPracticeSession

type FetchNextPracticeCardResult =
  | (LocalCard & { collection_id: string })
  | PracticeCardListResponse
  | null

type SubmitResultResponse = { is_correct: boolean } | { is_correct: boolean | null }

function normalizeSession(session: PracticeSession | LocalPracticeSession) {
  if ('is_completed' in session) {
    return {
      id: session.id,
      isComplete: session.is_completed,
      progress: {
        correct: session.correct_answers,
        incorrect: session.cards_practiced - session.correct_answers,
        total: session.total_cards,
      },
    }
  }

  return {
    id: session.id,
    isComplete: session.isCompleted,
    progress: {
      correct: session.correctAnswers,
      incorrect: session.cardsPracticed - session.correctAnswers,
      total: session.totalCards,
    },
  }
}

function extractCurrentCard(response: FetchNextPracticeCardResult): any {
  if (!response) return null
  if ('collection_id' in response) return response
  if ('data' in response && Array.isArray(response.data)) {
    const nextCardData = response.data[0]
    return nextCardData ? nextCardData.card : null
  }
  return null
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

  async function handleGuestSessionStart(collectionId: string): Promise<LocalPracticeSession> {
    const session = (await startPracticeSession(collectionId)) as LocalPracticeSession
    return session
  }

  async function handleGuestSubmitResult(
    state: PracticeSessionState,
    fetchNextPracticeCard: UseMutationResult<FetchNextPracticeCardResult, Error, string, void>,
    setState: Dispatch<SetStateAction<PracticeSessionState>>,
  ) {
    if (!state.sessionId) return
    const session = await practiceSessions.getLocalPracticeSessionById(state.sessionId)
    if (!session) return
    const normalized = normalizeSession(session)
    setState((prev: PracticeSessionState) => ({
      ...prev,
      progress: normalized.progress,
      isComplete: normalized.isComplete,
    }))
    if (!normalized.isComplete) {
      fetchNextPracticeCard.mutate(state.sessionId)
    }
  }

  const startSession = useMutation<SessionType | null, Error, void, void>({
    mutationFn: async () => {
      if (startingRef.current || state.sessionId) return null
      startingRef.current = true
      try {
        if (isGuest()) {
          return await handleGuestSessionStart(collectionId)
        }
        return (await startPracticeSession(collectionId)) as PracticeSession
      } finally {
        startingRef.current = false
      }
    },
    onSuccess: async (session) => {
      if (!session) return
      const normalized = normalizeSession(session)
      if (isGuest()) {
        const nextCard = await getNextLocalPracticeCard(normalized.id)
        setState((prev) => ({
          ...prev,
          sessionId: normalized.id,
          isComplete: normalized.isComplete,
          progress: normalized.progress,
          currentCard: nextCard,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          sessionId: normalized.id,
          isComplete: normalized.isComplete,
          progress: normalized.progress,
        }))
        if (!normalized.isComplete) {
          fetchNextPracticeCard.mutate(normalized.id)
        }
      }
    },
  })

  const fetchNextPracticeCard = useMutation<FetchNextPracticeCardResult, Error, string, void>({
    mutationFn: async (sessionId: string) => {
      if (isGuest()) {
        return await getNextLocalPracticeCard(sessionId)
      }
      const response = await listPracticeCards(sessionId)
      return response as PracticeCardListResponse
    },
    onSuccess: (response) => {
      setState((prev) => ({
        ...prev,
        currentCard: extractCurrentCard(response),
        isFlipped: false,
      }))
    },
  })

  const submitResult = useMutation<
    SubmitResultResponse,
    Error,
    { sessionId: string; cardId: string; isCorrect: boolean },
    void
  >({
    mutationFn: async ({ sessionId, cardId, isCorrect }) => {
      if (isGuest()) {
        await updateLocalPracticeCardResult(sessionId, cardId, isCorrect)
        return { is_correct: isCorrect }
      }
      return await updatePracticeCardResult(sessionId, cardId, isCorrect)
    },
    onSuccess: async (response) => {
      if (isGuest()) {
        await handleGuestSubmitResult(state, fetchNextPracticeCard, setState)
      } else {
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
      }
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
