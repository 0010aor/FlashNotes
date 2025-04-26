import Logo from '@/assets/Logo.svg'
import useAuth from '@/hooks/useAuth'
import { Button, Container, Field, Fieldset, Image, Text } from '@chakra-ui/react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UserRegister } from '../../client'
import { DefaultInput } from '../../components/commonUI/Input'
import PasswordInput from '../../components/commonUI/PasswordInput'
import { confirmPasswordRules, emailPattern, passwordRules } from '../../utils'

export const Route = createFileRoute('/_publicLayout/signup')({
  component: SignUp,
  beforeLoad: async () => {
    // NOTE: Direct localStorage access is used here because React context is not available in router guards.
    // For all React components, use useAuthContext() from './hooks/useAuthContext' instead.
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    const isLoggedIn = Boolean(localStorage.getItem('access_token')) || isGuest
    if (isLoggedIn) {
      throw redirect({
        to: '/',
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { t } = useTranslation()
  const { signUpMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    if (isSubmitting) return
    resetError()
    signUpMutation.mutate(data)
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
      <Image src={Logo} alt="Logo" height="auto" maxW="2xs" alignSelf="center" mb={4} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root maxW="sm">
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>{t('general.words.email')}</Field.Label>
              <DefaultInput
                placeholder={t('general.words.email')}
                type="email"
                {...register('email', {
                  required: t('general.errors.emailIsRequired'),
                  pattern: emailPattern,
                })}
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm">
                  {errors.email.message}
                </Text>
              )}
              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label>{t('general.words.password')}</Field.Label>
              <PasswordInput
                placeholder={t('general.words.password')}
                {...register('password', passwordRules())}
              />
              {errors.password && (
                <Text color="red.500" fontSize="sm">
                  {errors.password.message}
                </Text>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label>{t('general.actions.confirmPassword')}</Field.Label>
              <PasswordInput
                placeholder={t('general.actions.repeatPassword')}
                {...register('confirm_password', confirmPasswordRules(getValues))}
              />
              {errors.confirm_password && (
                <Text color="red.500" fontSize="sm">
                  {errors.confirm_password.message}
                </Text>
              )}
            </Field.Root>
          </Fieldset.Content>
          <Button type="submit" loading={isSubmitting}>
            {t('general.actions.signUp')}
          </Button>
        </Fieldset.Root>
      </form>
      <Text>
        {t('routes.publicLayout.signUp.alreadyHaveAccount')}{' '}
        <Link to="/login">
          <Text as="span" color="blue.500">
            {t('general.actions.login')}!
          </Text>
        </Link>
      </Text>
    </Container>
  )
}

export default SignUp
