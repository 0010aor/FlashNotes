import { useAuthContext } from '@/hooks/useAuthContext'
import { HStack, Text } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DefaultButton } from './Button'

export default function GuestModeNotice() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { logout } = useAuthContext()

  const handleLogin = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <HStack
      bg="orange.50"
      borderRadius="md"
      px={3}
      py={1}
      borderColor="orange.200"
      borderWidth="1px"
      color="orange.700"
      fontSize="sm"
      fontWeight="medium"
      pointerEvents="auto"
    >
      <Text textStyle="xs" display={{ base: 'block', md: 'none' }}>
        {t('components.guestModeNotice.message')}
      </Text>
      <Text display={{ base: 'none', md: 'block' }}>
        {t('components.guestModeNotice.messageWithAction')}
      </Text>
      <DefaultButton size="xs" onClick={handleLogin}>
        {t('general.actions.login')}
      </DefaultButton>
    </HStack>
  )
}
