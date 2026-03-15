/**
 * Configuración de idiomas del módulo i18n.
 * Para añadir un idioma: crear locales/{code}/ y registrar aquí.
 */

import es from './locales/es/index.js'
import en from './locales/en/index.js'

export const defaultLocale = 'es'

export const messages = {
  es,
  en,
}

export const supportedLocaleCodes = Object.keys(messages)
