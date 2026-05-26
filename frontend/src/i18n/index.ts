/**
 * Inicialización de i18next para maya_dashboard.
 *
 * Estructura alineada con el resto del ecosistema: JSON por namespaces +
 * commonResources del paquete shared (`@ceedcv-maya/shared-i18n-react`). El namespace
 * `common` mergea el shared (actions, status, pagination, feedback, …) con el
 * dominio del dashboard (nav, layout, profile, …); `auth` queda independiente.
 *
 * API pública (`useLocale`, `t`, `setLocale`) sigue importándose directamente
 * desde `@ceedcv-maya/shared-i18n-react`.
 */
import { createI18n } from '@ceedcv-maya/shared-i18n-react'
import { resources, NAMESPACES, SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './resources'

const i18n = createI18n(resources, NAMESPACES)

export default i18n

export { SUPPORTED_LOCALES, DEFAULT_LOCALE }
export type { SupportedLocale }

export async function changeLocale(locale: SupportedLocale): Promise<unknown> {
  return i18n.changeLanguage(locale)
}
