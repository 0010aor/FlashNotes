import CardEditor from '@/components/cards/CardEditor'
import CardHeader from '@/components/cards/CardHeader'
import { useRichTextEditor } from '@/components/commonUI/RichText/useRichTextEditor'
import { useCard } from '@/hooks/useCard'
import { HStack, VStack } from '@chakra-ui/react'
import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import ActionButton from '@/components/commonUI/ActionButton'
import { FaCheckCircle } from "react-icons/fa"
import { FaDeleteLeft } from "react-icons/fa6";

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

  const { generatedCard } = location.state || {};
  const frontEditor = useRichTextEditor({ content: card.front || '' })
  const backEditor = useRichTextEditor({ content: card.back || '' })

  useEffect(() => {
      if (frontEditor) {
        frontEditor.commands.setContent(generatedCard.front)
      }
      if (backEditor) {
        backEditor.commands.setContent(generatedCard.back)
      }
    }, [frontEditor, backEditor, card])

  const handleClose = async () => {
    await saveCard({
      ...card,
      front: frontEditor?.storage.markdown.getMarkdown() || '',
      back: backEditor?.storage.markdown.getMarkdown() || '',
    })
    navigate({ to: `/collections/${collectionId}` })
  }

  const handleRetry = () => {
    navigate({
      to: `/collections/${collectionId}`,
      state: { openAiDialog: true },
    });
  };

  return (
    <VStack h="calc(100dvh - 10rem)" width="100%" gap={4}>
      <CardHeader side={currentSide} onFlip={flip} onSave={handleClose} />
      <CardEditor
        side={currentSide}
        isFlipped={isFlipped}
        frontEditor={frontEditor}
        backEditor={backEditor}
      />
      <HStack width="100%" justify="center" pt={4}>
        <ActionButton
          colorPalette="red"
          onClick={handleRetry}
        >
          <FaDeleteLeft /> RECHAZAR Y REINTENTAR PROMPT
        </ActionButton>
        <ActionButton
          colorPalette="green"
          onClick={handleClose}
        >
          <FaCheckCircle /> ACEPTAR Y CERRAR
        </ActionButton>
      </HStack>
    </VStack>
  )
}
