import { CONSENT_KEY } from '@/lib/const/analytics'
import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react'
import posthog from 'posthog-js'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes as CloseIcon } from 'react-icons/fa'

const AnalyticsConsent: FC = () => {
  const [showConsent, setShowConsent] = useState<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_KEY)
    if (storedConsent === 'true') {
      setShowConsent(false)
      initializeAnalytics()
    } else if (storedConsent === 'false') {
      setShowConsent(false)
    } else {
      setShowConsent(true)
    }
  }, [])

  const initializeAnalytics = () => {
    if (
      import.meta.env.PROD &&
      import.meta.env.VITE_POSTHOG_API_KEY &&
      import.meta.env.VITE_POSTHOG_HOST
    ) {
      posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
      })
    }
  }

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true')
    setShowConsent(false)
    initializeAnalytics()
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'false')
    setShowConsent(false)
  }

  const handleClose = () => {
    setShowConsent(false)
  }

  if (!showConsent) {
    return null
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100dvw"
      height="100dvh"
      bg="blackAlpha.400"
      zIndex="overlay"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      alignItems="flex-end"
      pointerEvents="auto"
    >
      <Box
        maxW="sm"
        width="100%"
        bg="bg.100"
        color="fg.primary"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="bg.100"
        display="flex"
        flexDirection="column"
        gap={3}
        position="relative"
        pointerEvents="auto"
        mb={{ base: 4, md: 8 }}
        mr={{ base: 4, md: 8 }}
      >
        <IconButton
          aria-label={t('general.actions.close')}
          size="sm"
          variant="ghost"
          color="fg.muted"
          position="absolute"
          top={2}
          right={2}
          onClick={handleClose}
          _hover={{ bg: 'bg.50' }}
        >
          <CloseIcon />
        </IconButton>
        <Text fontWeight="bold" fontSize="lg" mb={1} display="flex" alignItems="center">
          {t('components.analyticsConsent.title')}{' '}
          <Box as="span" ml={1}>
            🍪
          </Box>
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={2}>
          {t('components.analyticsConsent.description')}
        </Text>
        <Flex gap={2} direction={{ base: 'column', md: 'row' }} justify="flex-end">
          <Button
            size="sm"
            variant="outline"
            color="fg.primary"
            borderColor="bg.200"
            borderRadius="md"
            onClick={handleDecline}
            _hover={{ bg: 'bg.50', borderColor: 'bg.200' }}
          >
            {t('components.analyticsConsent.decline')}
          </Button>
          <Button
            size="sm"
            minW={28}
            bg="accent.purple.light"
            color="gray.800"
            borderRadius="md"
            onClick={handleAccept}
            _hover={{ bg: 'accent.purple.dark' }}
            fontWeight="semibold"
          >
            {t('components.analyticsConsent.accept')}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default AnalyticsConsent
