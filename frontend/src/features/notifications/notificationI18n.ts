/**
 * Lee `metadata.i18n` de una notificación de alerta manual: mapas
 * { locale: value } para título y cuerpo, más el locale por defecto. Lo emite
 * el backend (PanelAlertNotificationService) para que el contenido libre se
 * muestre en el idioma del usuario sin que el worker conozca su locale.
 */
export type LocalizedMap = Record<string, string | undefined>

export interface NotificationI18nMeta {
  title?: LocalizedMap
  body?: LocalizedMap
  default?: string
}

export function readI18nMeta(metadata: Record<string, unknown> | null | undefined): NotificationI18nMeta {
  const i18n = metadata?.i18n
  if (i18n == null || typeof i18n !== 'object') return {}
  const m = i18n as Record<string, unknown>
  return {
    title: (m.title as LocalizedMap | undefined) ?? undefined,
    body: (m.body as LocalizedMap | undefined) ?? undefined,
    default: typeof m.default_locale === 'string' ? m.default_locale : undefined,
  }
}
