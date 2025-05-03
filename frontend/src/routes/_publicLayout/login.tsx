import Logo from '@/assets/Logo.svg'
import useAuth from '@/hooks/useAuth'
import { Box, Container, Field, Fieldset, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Body_login_login_access_token as AccessToken } from '../../client'
import { DefaultButton } from '../../components/commonUI/Button'
import { GoogleAuthButton } from '../../components/commonUI/GoogleAuthButton'
import { DefaultInput } from '../../components/commonUI/Input'
import { emailPattern } from '../../utils'

export const Route = createFileRoute('/_publicLayout/login')({
  component: Login,
  beforeLoad: async () => {
    // NOTE: Direct localStorage access is used here because React context is not available in router guards.
    // For all React components, use useAuthContext() from './hooks/useAuthContext' instead.
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    const isLoggedIn = Boolean(localStorage.getItem('access_token')) || isGuest
    if (isLoggedIn) {
      throw redirect({ to: '/collections' })
    }
  },
})

function Login() {
  const { t } = useTranslation()
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return
    resetError()
    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error is handled by useAuth hook
    }
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
  }

  return (
    <Container
      h="100dvh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Link to="/" style={{ display: 'flex', justifyContent: 'center' }}>
        <Image
          src={Logo}
          alt="Logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
          cursor="pointer"
        />
      </Link>

      <VStack gap={2} width="100%">
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <Fieldset.Root maxW="sm">
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>{t('general.words.email')}</Field.Label>
                <DefaultInput
                  type="email"
                  placeholder={t('general.words.email')}
                  {...register('username', {
                    required: t('general.errors.usernameIsRequired'),
                    pattern: emailPattern,
                  })}
                />
                {errors.username && (
                  <Text color="red.500" fontSize="sm">
                    {errors.username.message}
                  </Text>
                )}
                <Field.Root>
                  <Field.Label>{t('general.words.password')}</Field.Label>
                  <DefaultInput
                    type="password"
                    placeholder={t('general.words.password')}
                    {...register('password', {
                      required: t('general.errors.passwordIsRequired'),
                    })}
                  />
                  {error && (
                    <Text color="red.500" fontSize="sm">
                      {error}
                    </Text>
                  )}
                </Field.Root>
              </Field.Root>
            </Fieldset.Content>
            <DefaultButton type="submit" loading={isSubmitting} color="fg.primary" width="100%">
              {t('general.actions.login')}
            </DefaultButton>
          </Fieldset.Root>
        </form>

        <HStack width="100%" gap={2} my={0.5}>
          <Box flex="1" height="1px" bg="bg.200" />
          <Text fontSize="sm" color="fg.muted" px={2}>
            {t('general.words.or')}
          </Text>
          <Box flex="1" height="1px" bg="bg.200" />
        </HStack>

        <GoogleAuthButton action="login" onClick={handleGoogleLogin} />
      </VStack>
      <Box pl={0} ml={0}>
        <Text textAlign="left" pl={0} ml={0}>
          {t('routes.publicLayout.login.dontHaveAccount')}{' '}
          <Link to="/signup">
            <Text as="span" color="blue.500">
              {t('general.actions.signUp')}
            </Text>
          </Link>
        </Text>
      </Box>
    </Container>
  )
}
