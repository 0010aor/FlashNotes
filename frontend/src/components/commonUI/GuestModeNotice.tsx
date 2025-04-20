import { HStack, Text } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { setGuestMode } from '../../hooks/useAuth'
import { DefaultButton } from './Button'

export default function GuestModeNotice() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogin = () => {
    localStorage.removeItem('access_token')
    setGuestMode(false)
    navigate({ to: '/login' })
  }

  return (
    <HStack
      bg="orange.50"
      borderRadius="md"
      px={3}
      py={1}
      borderColor="orange.200"
      color="orange.700"
      fontSize="sm"
      fontWeight="medium"
      pointerEvents="auto"
    >
      <Text display={{ base: 'block', md: 'none' }}>{t('components.guestModeNotice.message')}</Text>
      <Text display={{ base: 'none', md: 'block' }}>
        {t('components.guestModeNotice.messageWithAction')}
      </Text>
      <DefaultButton size="xs" onClick={handleLogin}>
        {t('general.actions.login')}
      </DefaultButton>
    </HStack>
  )
}
