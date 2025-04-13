import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toaster } from '@/components/ui/toaster'
import { AxiosError } from 'axios'
import {
  type Body_login_login_access_token as AccessToken,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from '../client'

interface ErrorResponse {
  body: {
    detail?: string
  }
}

const isLoggedIn = () => {
  return localStorage.getItem('access_token') !== null
}

const useAuth = () => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ['currentUser'],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) => UsersService.registerUser({ requestBody: data }),

    onSuccess: () => {
      navigate({ to: '/login' })
      toaster.create({
        title: t('hooks.auth.accountCreated'),
        description: t('hooks.auth.accountCreatedDescription'),
        type: 'success',
      })
    },
    onError: (err: Error | AxiosError | ErrorResponse) => {
      const errDetail =
        err instanceof AxiosError
          ? err.message
          : 'body' in err && typeof err.body === 'object' && err.body
            ? String(err.body.detail) || t('general.errors.somethingWentWrong')
            : t('general.errors.somethingWentWrong')

      toaster.create({
        title: t('general.errors.errorCreatingAccount'),
        description: errDetail,
        type: 'error',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem('access_token', response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: '/collections' })
    },
    onError: (err: Error | AxiosError | ErrorResponse) => {
      const errDetail =
        err instanceof AxiosError
          ? err.message
          : 'body' in err && typeof err.body === 'object' && err.body
            ? String(err.body.detail) || t('general.errors.somethingWentWrong')
            : t('general.errors.somethingWentWrong')

      const finalError = Array.isArray(errDetail)
        ? t('general.errors.invalidCredentials')
        : errDetail

      toaster.create({
        title: t('general.errors.loginFailed'),
        description: finalError,
        type: 'error',
      })
      setError(finalError)
    },
  })

  const logout = () => {
    localStorage.removeItem('access_token')
    navigate({ to: '/' })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth
