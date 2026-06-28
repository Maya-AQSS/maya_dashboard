import { useQuery } from '@tanstack/react-query'
import { listLanguages } from './api'
import type { Language } from './types'

/** Fallback con catálogo i18n de UI mientras carga o si el endpoint falla. */
const FALLBACK_LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', is_default: true },
  { code: 'va', name: 'Valencià', is_default: false },
  { code: 'en', name: 'English', is_default: false },
]

export interface UseLanguagesResult {
  languages: Language[]
  defaultLocale: string
  loading: boolean
}

/**
 * Idiomas disponibles para formularios multiidioma y selector de perfil.
 * Cachea 1h (catálogo casi estático) y degrada al fallback es/va/en.
 */
export function useLanguages(): UseLanguagesResult {
  const { data, isPending } = useQuery({
    queryKey: ['languages'],
    queryFn: listLanguages,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  const languages = data && data.length > 0 ? data : FALLBACK_LANGUAGES
  const defaultLocale = (languages.find((l) => l.is_default) ?? languages[0]).code

  return { languages, defaultLocale, loading: isPending }
}
