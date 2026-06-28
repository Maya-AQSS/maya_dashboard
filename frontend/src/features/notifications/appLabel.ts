type TranslateFn = (key: string, opts?: { defaultValue?: string }) => string

/**
 * Maps a messaging app slug (maya-dms, maya-authorization, …) to a friendly
 * application name via i18n (notifications.apps.<slug>), falling back to the slug.
 */
export function notificationAppLabel(t: TranslateFn, app: string): string {
  return t(`notifications.apps.${app}`, { defaultValue: app })
}
