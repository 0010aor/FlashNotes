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
  const rules: {
    minLength: { value: number; message: string }
    required?: string
  } = {
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

export const confirmPasswordRules = (getValues: () => unknown, isRequired = true) => {
  const rules: {
    validate: (value: string) => boolean | string
    required?: string
  } = {
    validate: (value: string) => {
      const formValues = getValues() as {
        password?: string
        new_password?: string
      }
      const password = formValues.password || formValues.new_password
      return value === password ? true : t('general.errors.passwordsDoNotMatch')
    },
  }

  if (isRequired) {
    rules.required = t('general.errors.passwordConfirmationIsRequired')
  }

  return rules
}

export const handleError = (
  err: ApiError,
  showToast: (title: string, message: string, type: string) => void,
) => {
  const errDetail = (err.body as { detail?: string | { msg: string }[] })?.detail
  let errorMessage = t('general.errors.default')

  if (typeof errDetail === 'string') {
    errorMessage = errDetail
  } else if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  showToast(t('general.errors.error'), errorMessage, 'error')
}
