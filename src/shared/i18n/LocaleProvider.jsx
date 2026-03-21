import { useState, useMemo, useEffect, useCallback } from 'react'
import { getNested, interpolate } from './utils.js'
import { messages, defaultLocale } from './config.js'
import { LocaleContext } from './localeContext.js'

function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const stored = localStorage.getItem('locale')
      if (stored && messages[stored]) return stored
    } catch {
      /* localStorage no disponible */
    }
    return defaultLocale
  })

  const setLocale = useCallback((nextLocale) => {
    if (messages[nextLocale]) setLocaleState(nextLocale)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('locale', locale)
    } catch {
      /* localStorage no disponible */
    }
  }, [locale])

  useEffect(() => {
    const htmlLang =
      locale === 'va' ? 'ca' : locale === 'en' ? 'en' : 'es'
    document.documentElement.lang = htmlLang
  }, [locale])

  const value = useMemo(() => {
    const dict = messages[locale] ?? messages[defaultLocale]
    const t = (key, vars) => {
      const out = getNested(dict, key)
      return out != null ? interpolate(out, vars) : key
    }
    const localeOptions = Object.entries(messages).map(([code, m]) => ({
      code,
      label: m.meta?.localeName ?? code,
    }))
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
