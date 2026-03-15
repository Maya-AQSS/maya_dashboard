/**
 * Configuración de idiomas del módulo i18n.
 * Para añadir un idioma: crear locales/{code}/ y registrar aquí.
 */

import va from './locales/va/index.js'
import es from './locales/es/index.js'
import en from './locales/en/index.js'
import de from './locales/de/index.js'
import it from './locales/it/index.js'
import fr from './locales/fr/index.js'
import pt from './locales/pt/index.js'
import ru from './locales/ru/index.js'

export const defaultLocale = 'va'

export const messages = {
  va,
  es,
  en,
  de,
  it,
  fr,
  pt,
  ru,
}

export const supportedLocaleCodes = Object.keys(messages)

/** Locale BCP 47 para formatear fechas con toLocaleString (código i18n → tag Intl). */
export const dateLocaleMap = {
  va: 'ca-ES',
  es: 'es-ES',
  en: 'en-GB',
  de: 'de-DE',
  it: 'it-IT',
  fr: 'fr-FR',
  pt: 'pt-PT',
  ru: 'ru-RU',
}

export function getDateLocale(localeCode) {
  return dateLocaleMap[localeCode] ?? 'en-GB'
}
