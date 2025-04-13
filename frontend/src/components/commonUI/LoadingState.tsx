import { Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface LoadingStateProps {
  message?: string
}

function LoadingState({ message = '' }: LoadingStateProps) {
  const { t } = useTranslation()
  message = message || `${t('general.actions.loading')}...`
  return (
    <Center h="50dvh">
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.500">{message}</Text>
      </VStack>
    </Center>
  )
}

export default LoadingState
