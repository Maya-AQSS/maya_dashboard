import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { getNested, interpolate } from './utils.js'
import { messages, defaultLocale } from './config.js'
import { LocaleContext } from './localeContext.js'

const localeOptions = Object.entries(messages).map(([code, m]) => ({
  code,
  label: m.meta?.localeName ?? code,
}))

function readStoredLocale() {
  try {
    const stored = localStorage.getItem('locale')
    if (stored && messages[stored]) return stored
  } catch {
    /* localStorage no disponible */
  }
  return null
}

function LocaleProvider({ children }) {
  const { user, updateLocale: persistLocaleToKeycloak } = useAuth()
  const keycloakLocale = user?.locale && messages[user.locale] ? user.locale : null

  // Initial locale resolution priority: Keycloak token claim > localStorage > default
  const [locale, setLocaleState] = useState(() => keycloakLocale ?? readStoredLocale() ?? defaultLocale)
  const appliedKeycloakLocale = useRef(keycloakLocale)

  // If the Keycloak token delivers a locale later (e.g. after auth init finishes),
  // adopt it — but only once per value, so we don't overwrite a user-initiated change.
  useEffect(() => {
    if (keycloakLocale && keycloakLocale !== appliedKeycloakLocale.current) {
      appliedKeycloakLocale.current = keycloakLocale
      setLocaleState(keycloakLocale)
    }
  }, [keycloakLocale])

  const setLocale = useCallback((nextLocale) => {
    if (!messages[nextLocale]) return
    setLocaleState(nextLocale)
    try {
      localStorage.setItem('locale', nextLocale)
    } catch {
      /* localStorage no disponible */
    }
    // Persist to Keycloak user attribute so the choice follows the user across
    // apps and devices. Fire-and-forget: UI has already updated optimistically.
    if (persistLocaleToKeycloak) {
      persistLocaleToKeycloak(nextLocale).catch(() => {
        /* network/CORS — UI still reflects the change, will retry next selection */
      })
    }
  }, [persistLocaleToKeycloak])

  useEffect(() => {
    const htmlLang = locale === 'va' ? 'ca' : locale === 'en' ? 'en' : 'es'
    document.documentElement.lang = htmlLang
  }, [locale])

  const value = useMemo(() => {
    const dict = messages[locale] ?? messages[defaultLocale]
    const t = (key, vars) => {
      const out = getNested(dict, key)
      return out != null ? interpolate(out, vars) : key
    }
    return {
      locale,
      setLocale,
      t,
      supportedLocales: Object.keys(messages),
      localeOptions,
    }
  }, [locale, setLocale])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export { LocaleProvider }
