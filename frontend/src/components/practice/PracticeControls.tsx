import { Flex, HStack, IconButton } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { BlueButton } from '../commonUI/Button'

interface PracticeControlsProps {
  isFlipped: boolean
  onFlip: () => void
  onAnswer: (correct: boolean) => void
}

function PracticeControls({ isFlipped, onFlip, onAnswer }: PracticeControlsProps) {
  const { t } = useTranslation()
  if (!isFlipped) {
    return (
      <Flex height="5rem" justifyContent="center" alignItems="center">
        <BlueButton onClick={onFlip}>{t('general.actions.showAnswer')}</BlueButton>
      </Flex>
    )
  }

  return (
    <HStack gap={20} height="5rem">
      <IconButton
        aria-label={t('general.actions.doNotKnow')}
        onClick={() => onAnswer(false)}
        rounded="full"
        size="2xl"
        bg="bg.100"
        borderWidth="1px"
        borderColor="bg.200"
        _hover={{
          bg: 'rgba(205, 32, 32, 0.25)',
          borderColor: 'red',
        }}
        _active={{
          bg: 'rgba(205, 32, 32, 0.35)',
          borderColor: 'red',
        }}
      >
        <FaTimes color="white" />
      </IconButton>
      <IconButton
        aria-label="Know"
        onClick={() => onAnswer(true)}
        rounded="full"
        size="2xl"
        bg="bg.100"
        borderWidth="1px"
        borderColor="bg.200"
        _hover={{
          bg: 'rgba(46, 160, 67, 0.25)',
          borderColor: 'green',
        }}
        _active={{
          bg: 'rgba(46, 160, 67, 0.35)',
          borderColor: 'green',
        }}
      >
        <FaCheck color="white" />
      </IconButton>
    </HStack>
  )
}

export default PracticeControls
