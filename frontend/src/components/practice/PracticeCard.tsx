import type { Card } from '@/client'
import { Box } from '@chakra-ui/react'
import RichTextContent from '../commonUI/RichText/RichTextContent'

interface PracticeCardProps {
  card: Card
  isFlipped: boolean
  onFlip: () => void
}

function PracticeCard({ card, isFlipped, onFlip }: PracticeCardProps) {
  const commonCardStyles = {
    padding: '1rem',
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    borderRadius: 'lg',
    borderWidth: '1px',
    boxShadow: 'sm',
    borderColor: 'bg.200',
    cursor: 'pointer',
  }

  return (
    <Box
      onClick={onFlip}
      position="relative"
      height="100%"
      width="100%"
      style={{ perspective: '1000px' }}
      transition="transform 0.3s ease"
      transformStyle="preserve-3d"
      transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'}
    >
      <Box {...commonCardStyles} bg="bg.50">
        <RichTextContent content={card.front} isVisible={!isFlipped} />
      </Box>

      <Box {...commonCardStyles} bg="bg.100" transform="rotateY(180deg)">
        <RichTextContent content={card.back} isVisible={isFlipped} />
      </Box>
    </Box>
  )
}

export default PracticeCard
