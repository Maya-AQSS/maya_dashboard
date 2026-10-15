/**
 * Relevo SSO `?return_to=<url>` (ReturnToHandler de App.tsx): tras iniciar sesión, el dashboard
 * vuelve a `<url>` con el token en el fragmento (`#session_token=…`). Como el token viaja en la
 * URL, solo se devuelve a los frontends de las apps Maya del mismo despliegue (§ 4.4, defecto
 * 13: antes solo se aceptaban `localhost` y `*.localhost`, y en producción se ignoraba).
 *
 * Hosts admitidos, con https, derivados del propio host del dashboard con la convención de
 * peerService (`<prefijo><app>.<dominio>`):
 *   producción  dashboard.ceedcv                     → dms.ceedcv, logs.ceedcv…
 *   desarrollo  dev-dashboard.10.224.237.230.nip.io  → dev-dms.10.224.237.230.nip.io…
 * y, como hasta ahora, `localhost` y `*.localhost` (http o https) para el desarrollo local.
 * Nunca otros hosts del dominio (odoo.ceedcv, n8n.ceedcv…).
 */
export const MAYA_FRONTENDS = ['dashboard', 'authorization', 'dms', 'logs', 'audit'] as const

const SELF = 'dashboard'

export function isAllowedReturnUrl(
  url: string,
  currentHostname: string = window.location.hostname,
): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  const host = parsed.hostname
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }

  return parsed.protocol === 'https:' && mayaFrontendHosts(currentHostname).includes(host)
}

/** Hosts de los frontends Maya hermanos del dashboard (vacío si el host no sigue la convención). */
function mayaFrontendHosts(currentHostname: string): string[] {
  const dot = currentHostname.indexOf('.')
  if (dot <= 0) return []

  const label = currentHostname.slice(0, dot)
  const domain = currentHostname.slice(dot + 1)
  if (!label.endsWith(SELF)) return []

  const prefix = label.slice(0, -SELF.length)
  return MAYA_FRONTENDS.map((app) => `${prefix}${app}.${domain}`)
}
