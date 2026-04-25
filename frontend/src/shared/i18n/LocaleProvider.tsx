/**
 * LocaleProvider — backed by i18next.
 *
 * Mantiene la API pública original (locale, setLocale, t, supportedLocales,
 * localeOptions) para que todos los componentes existentes sigan funcionando
 * sin cambios. La inicialización de i18next ocurre en src/i18n/index.ts.
 */
import { useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@maya/shared-auth-react'
import { messages, dateLocaleMap } from './config.js'
import { LocaleContext } from './localeContext.js'
import '../../i18n/index.js'

const localeOptions = Object.entries(messages).map(([code, m]) => ({
  code,
  label: (m as Record<string, unknown> & { meta?: { localeName?: string } }).meta?.localeName ?? code,
}))

function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation()
  const { user, updateLocale: persistLocaleToKeycloak } = useAuth()

  // Sync Keycloak locale to i18next on mount / user change
  useEffect(() => {
    const kc = user?.locale
    if (kc && messages[kc] && kc !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(kc)
    }
  }, [user?.locale, i18n])

  // Update <html lang> whenever i18n language changes
  useEffect(() => {
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'es'
    document.documentElement.lang = lang === 'va' ? 'ca' : lang
  }, [i18n.resolvedLanguage, i18n.language])

  const setLocale = useCallback(
    (nextLocale: string) => {
      if (!messages[nextLocale]) return
      void i18n.changeLanguage(nextLocale)
      try { localStorage.setItem('locale', nextLocale) } catch { /* noop */ }
      if (persistLocaleToKeycloak) {
        persistLocaleToKeycloak(nextLocale).catch(() => { /* fire-and-forget */ })
      }
    },
    [i18n, persistLocaleToKeycloak],
  )

  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'es'
  const dateLocale = dateLocaleMap[locale] ?? 'en-GB'

  const value = useMemo(
    () => ({ locale, setLocale, t, supportedLocales: Object.keys(messages), localeOptions, dateLocale }),
    [locale, setLocale, t, dateLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export { LocaleProvider }
