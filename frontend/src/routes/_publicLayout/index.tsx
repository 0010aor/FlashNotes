import { BlueButton, DefaultButton } from '@/components/commonUI/Button'
import { Footer } from '@/components/commonUI/Footer'
import { useColorMode } from '@/components/ui/color-mode'
import { useAuthContext } from '@/hooks/useAuthContext'
import { Container, Heading, Image, Stack, Text, VStack } from '@chakra-ui/react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_publicLayout/')({
  component: LandingPage,
})

function LandingPage() {
  const { t } = useTranslation()
  const { isLoggedIn, setGuestMode } = useAuthContext()
  const { colorMode } = useColorMode()
  const navigate = useNavigate()

  const videoSrc = colorMode === 'dark' ? '/preview_dark.mp4' : '/preview_light.mp4'

  const handleTryAsGuest = () => {
    setGuestMode(true)
    navigate({ to: '/collections' })
  }

  return (
    <Container
      py={{ base: 20, lg: 0 }}
      minH={{ base: 'auto', lg: '100dvh' }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        gap={10}
        align="center"
        justify={{ base: 'flex-start', lg: 'center' }}
      >
        <VStack gap={8} align={{ base: 'center', lg: 'flex-start' }} flex={1}>
          <Image src="/favicon.svg" alt="FlashNotes favicon" w="100px" />
          <Heading as="h1" size="2xl" fontWeight="bold" textAlign={{ base: 'center', lg: 'left' }}>
            {t('routes.publicLayout.index.title')}
          </Heading>
          <Text fontSize="xl" color="gray.500" textAlign={{ base: 'center', lg: 'left' }}>
            {t('routes.publicLayout.index.description')}
          </Text>
          <Stack direction="row" gap={4}>
            {isLoggedIn ? (
              <Link to="/collections">
                <BlueButton size="lg">{t('general.actions.letsStudy')}!</BlueButton>
              </Link>
            ) : (
              <Stack direction="row" gap={4}>
                <Link to="/login">
                  <DefaultButton size="lg">{t('general.actions.login')}</DefaultButton>
                </Link>
                <DefaultButton size="lg" onClick={handleTryAsGuest}>
                  {t('general.actions.tryOffline', 'Try Offline')}
                </DefaultButton>
              </Stack>
            )}
          </Stack>
        </VStack>

        <VStack flex={1} gap={8}>
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            style={{
              width: '100%',
              maxWidth: '20rem',
              borderRadius: '12px',
              borderWidth: '2px',
              borderColor: 'var(--chakra-colors-bg-100)',
            }}
          />
        </VStack>
      </Stack>

      <VStack gap={16} mt={20}>
        <Heading as="h2" size="xl" textAlign="center">
          {t('general.words.features')}
        </Heading>
        <Stack direction={{ base: 'column', md: 'row' }} gap={8} align="stretch">
          <Feature
            title={t('routes.publicLayout.index.offlineMode')}
            description={t('routes.publicLayout.index.offlineModeDescription')}
          />
          <Feature
            title={t('routes.publicLayout.index.aiGeneration')}
            description={t('routes.publicLayout.index.aiGenerationDescription')}
          />
          <Feature
            title={t('routes.publicLayout.index.responsiveDesign')}
            description={t('routes.publicLayout.index.responsiveDesignDescription')}
          />
        </Stack>
      </VStack>
      <Footer version="0.0.17" />
    </Container>
  )
}

function Feature({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <VStack
      p={8}
      bg="bg.box"
      borderRadius="lg"
      gap={4}
      flex={1}
      align="flex-start"
      borderWidth="1px"
      borderColor="bg.100"
    >
      <Heading as="h3" size="md">
        {title}
      </Heading>
      <Text color="gray.500">{description}</Text>
    </VStack>
  )
}
