import starsAnimation from '@/assets/stars.json?url'
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BlueButton } from '../commonUI/Button'
import { DefaultButton } from '../commonUI/Button'

interface PracticeStats {
  correct: number
  incorrect: number
  total: number
}

interface PracticeCompleteProps {
  stats: PracticeStats
  onReset: () => void
}

function PracticeComplete({ stats, onReset }: PracticeCompleteProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const total = stats.total

  return (
    <Center h="60dvh">
      <VStack gap={6} p={8}>
        <Box w="15rem">
          <DotLottieReact src={starsAnimation} autoplay />
        </Box>
        <Text fontSize="2xl">{t('components.practiceComplete.title')}!</Text>
        <Text fontSize="lg">
          {t('components.practiceComplete.cardsCorrect', {
            correct: stats.correct,
            total,
          })}
        </Text>
        <HStack gap={4}>
          <DefaultButton onClick={() => router.history.back()}>
            {t('general.actions.backToCollection')}
          </DefaultButton>
          <BlueButton onClick={onReset}>{t('general.actions.practiceAgain')}</BlueButton>
        </HStack>
      </VStack>
    </Center>
  )
}

export default PracticeComplete
