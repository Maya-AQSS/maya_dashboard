/**
 * Configuración de idiomas del módulo i18n.
 * Para añadir un idioma: crear locales/{code}/ y registrar aquí.
 */

import va from './locales/va/index.js'
import es from './locales/es/index.js'
import en from './locales/en/index.js'

export const defaultLocale = 'es'

export const messages = {
  va,
  es,
  en,
}

export const supportedLocaleCodes = Object.keys(messages)

/** Locale BCP 47 para formatear fechas con toLocaleString (código i18n → tag Intl). */
export const dateLocaleMap: Record<string, string> = {
  va: 'ca-ES',
  es: 'es-ES',
  en: 'en-GB',
}

export function getDateLocale(localeCode: string): string {
  return dateLocaleMap[localeCode] ?? 'en-GB'
}
