/**
 * Inicialización de i18next para maya_dashboard.
 * Reutiliza los archivos de locale existentes en shared/i18n/locales/.
 * La API pública (useLocale, t, setLocale) se mantiene vía el shim en shared/i18n.
 */
import { createI18n } from '@maya/shared-i18n-react'
import { messages, defaultLocale, supportedLocaleCodes } from '../shared/i18n/config.js'

// Build i18next resources from existing locale data: { es: { common: {...} }, ... }
const resources = Object.fromEntries(
  Object.entries(messages).map(([code, data]) => [code, { common: data }]),
)

const i18n = createI18n(resources, ['common'])

export default i18n

export type SupportedLocale = string
export const DEFAULT_LOCALE: SupportedLocale = defaultLocale
export const SUPPORTED_LOCALES: SupportedLocale[] = supportedLocaleCodes

export async function changeLocale(locale: SupportedLocale): Promise<unknown> {
  return i18n.changeLanguage(locale)
}
