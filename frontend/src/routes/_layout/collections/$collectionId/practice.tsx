import CardSkeleton from '@/components/commonUI/CardSkeleton'
import ErrorState from '@/components/commonUI/ErrorState'
import PracticeCard from '@/components/practice/PracticeCard'
import PracticeComplete from '@/components/practice/PracticeComplete'
import PracticeControls from '@/components/practice/PracticeControls'
import PracticeHeader from '@/components/practice/PracticeHeader'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { VStack } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_layout/collections/$collectionId/practice')({
  component: PracticeComponent,
})

function PracticeComponent() {
  const { collectionId } = Route.useParams()
  const {
    currentCard,
    isFlipped,
    progress,
    isComplete,
    isLoading,
    error,
    handleFlip,
    handleAnswer,
    reset,
    start,
  } = usePracticeSession(collectionId)

  useEffect(() => {
    start()
  }, [start])

  if (isLoading) return <CardSkeleton />
  if (error) return <ErrorState error={error} />
  if (isComplete) return <PracticeComplete stats={progress} onReset={reset} />
  if (!currentCard) return <CardSkeleton />

  return (
    <VStack gap={4} h="calc(100dvh - 8rem)" width="100%">
      <PracticeHeader cardId={currentCard.id} progress={progress} collectionId={collectionId} />
      <PracticeCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
      <PracticeControls isFlipped={isFlipped} onFlip={handleFlip} onAnswer={handleAnswer} />
    </VStack>
  )
}
