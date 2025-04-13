import type { ApiError } from './client'
import i18n, { i18nPromise } from './i18n'

let t: (key: string) => string = () => ''

i18nPromise.then(() => {
  t = i18n.t.bind(i18n)
})

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: t('general.errors.invalidEmail'),
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: t('general.errors.invalidName'),
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: t('general.errors.passwordMinCharacters'),
    },
  }

  if (isRequired) {
    rules.required = t('general.errors.passwordIsRequired')
  }

  return rules
}

export const confirmPasswordRules = (getValues: () => any, isRequired = true) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : t('general.errors.passwordsDoNotMatch')
    },
  }

  if (isRequired) {
    rules.required = t('general.errors.passwordConfirmationIsRequired')
  }

  return rules
}

export const handleError = (err: ApiError, showToast: any) => {
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || t('general.errors.default')
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  showToast(t('general.errors.error'), errorMessage, 'error')
}
