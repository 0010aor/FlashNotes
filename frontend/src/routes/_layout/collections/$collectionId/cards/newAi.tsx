import CardEditor from '@/components/cards/CardEditor'
import CardHeader from '@/components/cards/CardHeader'
import { useRichTextEditor } from '@/components/commonUI/RichText/useRichTextEditor'
import { useCard } from '@/hooks/useCard'
import { VStack } from '@chakra-ui/react'
import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute(
  '/_layout/collections/$collectionId/cards/newAi',
)({
  component: NewCardAi,
})

function NewCardAi() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collectionId } = Route.useParams()
  const { card, currentSide, isFlipped, saveCard, flip } = useCard(collectionId)

  const { cardData } = location.state || {};
  const frontEditor = useRichTextEditor({ content: card.front || '' })
  const backEditor = useRichTextEditor({ content: card.back || '' })

  useEffect(() => {
      if (frontEditor) {
        frontEditor.commands.setContent(cardData.front)
      }
      if (backEditor) {
        backEditor.commands.setContent(cardData.back)
      }
    }, [frontEditor, backEditor, card])

  const handleClose = async () => {
    alert("Closed!")
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
