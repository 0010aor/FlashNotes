import { HStack, IconButton, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FiRepeat } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'

interface CardHeaderProps {
  side: 'front' | 'back'
  onFlip: () => void
  onSave: () => void
}

function CardHeader({ side, onFlip, onSave }: CardHeaderProps) {
  const { t } = useTranslation()
  return (
    <HStack w="100%" justifyContent="space-between" alignItems="center">
      <IconButton
        colorPalette="teal"
        size="sm"
        onClick={onFlip}
        aria-label={t('components.cardHeader.switchCard')}
        variant="ghost"
        _hover={{
          transform: 'scale(1.05)',
          bg: 'bg.50',
        }}
      >
        <FiRepeat />
      </IconButton>
      <Text
        fontSize="md"
        color="fg.DEFAULT"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {t(`general.words.${side}`)}
      </Text>
      <IconButton
        colorPalette="teal"
        size="sm"
        aria-label={t('general.actions.save')}
        variant="ghost"
        onClick={onSave}
        _hover={{
          transform: 'scale(1.05)',
          bg: 'bg.50',
        }}
      >
        <IoClose />
      </IconButton>
    </HStack>
  )
}

export default CardHeader
