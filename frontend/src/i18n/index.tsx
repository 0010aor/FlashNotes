import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

import { initReactI18next } from 'react-i18next'

export const LOCALE_KEYS = [
  { key: 'en', name: 'English', flag: 'us' },
  { key: 'es', name: 'Español', flag: 'es' },
  { key: 'nl', name: 'Nederlands', flag: 'nl' },
]

export const i18nPromise = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng: string) => lng.replace('-', '_'),
    },
    supportedLngs: LOCALE_KEYS.map(({ key }: { key: string }) => key),
    fallbackLng: LOCALE_KEYS[0].key,
    debug: !import.meta.env.PROD,
  })

export default i18n
