import useAuth from '@/hooks/useAuth'
import { Button, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

function ErrorState({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  const { t } = useTranslation()
  const { logout } = useAuth()

  return (
    <VStack gap={4} p={8} textAlign="center">
      <Text color="red.500" fontSize="lg">
        {error?.message || 'Something went wrong'}
      </Text>
      {onRetry ? (
        <Button onClick={onRetry}>{t('general.errors.tryAgain')}</Button>
      ) : (
        <Button onClick={() => logout()}>{t('general.actions.goHome')}</Button>
      )}
    </VStack>
  )
}

export default ErrorState
