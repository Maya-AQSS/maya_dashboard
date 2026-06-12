/**
 * Inicialización de i18next para maya_dashboard.
 *
 * Estructura alineada con el resto del ecosistema: JSON por namespaces +
 * commonResources del paquete shared (`@ceedcv-maya/shared-i18n-react`). El namespace
 * `common` mergea el shared (actions, status, pagination, feedback, …) con el
 * dominio del dashboard (nav, layout, profile, …); `auth` queda independiente.
 *
 * 0.16.0: el boilerplate (createI18n + changeLocale) vive en `createAppI18n`
 * del paquete compartido. API pública (`useLocale`, `t`, `setLocale`) sigue
 * importándose directamente desde `@ceedcv-maya/shared-i18n-react`.
 */
import { createAppI18n } from '@ceedcv-maya/shared-i18n-react'
import { resources, NAMESPACES, SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './resources'

export const { i18n, changeLocale } = createAppI18n(resources, NAMESPACES)

export default i18n

export { SUPPORTED_LOCALES, DEFAULT_LOCALE }
export type { SupportedLocale }
