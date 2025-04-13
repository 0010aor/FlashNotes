import CardEditor from '@/components/cards/CardEditor'
import CardHeader from '@/components/cards/CardHeader'
import { useRichTextEditor } from '@/components/commonUI/RichText/useRichTextEditor'
import { useCard } from '@/hooks/useCard'
import { VStack } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/collections/$collectionId/cards/new')({
  component: NewCard,
})

function NewCard() {
  const navigate = useNavigate()
  const { collectionId } = Route.useParams()
  const { card, currentSide, isFlipped, saveCard, flip } = useCard(collectionId)

  const frontEditor = useRichTextEditor({ content: card.front || '' })
  const backEditor = useRichTextEditor({ content: card.back || '' })

  const handleClose = async () => {
    await saveCard({
      ...card,
      front: frontEditor?.storage.markdown.getMarkdown() || '',
      back: backEditor?.storage.markdown.getMarkdown() || '',
    })
    navigate({ to: `/collections/${collectionId}` })
  }

  return (
    <VStack h="calc(100dvh - 10rem)" width="100%" gap={4}>
      <CardHeader side={currentSide} onFlip={flip} onSave={handleClose} />
      <CardEditor
        side={currentSide}
        isFlipped={isFlipped}
        frontEditor={frontEditor}
        backEditor={backEditor}
      />
    </VStack>
  )
}
