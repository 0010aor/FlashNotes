import RichTextEditor from '@/components/commonUI/RichText/RichTextEditor'
import { Box } from '@chakra-ui/react'
import type { Editor } from '@tiptap/react'

export interface CardEditorProps {
  side: 'front' | 'back'
  isFlipped: boolean
  frontEditor: Editor | null
  backEditor: Editor | null
}

export default function CardEditor({ side, isFlipped, frontEditor, backEditor }: CardEditorProps) {
  const commonBoxStyles = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    borderRadius: 'lg',
    borderWidth: '1px',
    boxShadow: 'sm',
    borderColor: 'bg.200',
    cursor: 'text',
  }

  return (
    <Box
      position="relative"
      height="100%"
      width="100%"
      style={{ perspective: '1000px' }}
      transition="transform 0.3s ease"
      transformStyle="preserve-3d"
      transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'}
    >
      <Box {...commonBoxStyles} bg="bg.50">
        {side === 'front' && frontEditor && <RichTextEditor editor={frontEditor} />}
      </Box>

      <Box
        {...commonBoxStyles}
        bg="bg.box"
        transform="rotateY(180deg)"
        visibility={isFlipped ? 'visible' : 'hidden'}
      >
        {side === 'back' && backEditor && <RichTextEditor editor={backEditor} />}
      </Box>
    </Box>
  )
}
