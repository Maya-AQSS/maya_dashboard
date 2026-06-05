import { apiGetJson } from '../../api/http'
import type { Language } from './types'

interface EnvelopedLanguages {
  data: Language[]
}

/** Idiomas activos disponibles, el por defecto primero. */
export async function listLanguages(): Promise<Language[]> {
  const res = await apiGetJson<EnvelopedLanguages>('/languages')
  return res.data
}
