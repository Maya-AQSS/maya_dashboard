import { peerOrigin } from '../../lib/peerService'

export interface ResourceTarget {
  /** true → navigate within this SPA (react-router); false → full navigation. */
  internal: boolean
  href: string
}

/**
 * Resolves a notification's click-through target. The stored `url` is relative
 * to the `target_app` frontend (e.g. /documents/42 in dms). Same-app/dashboard
 * urls stay internal (SPA); cross-app urls are made absolute via peerOrigin so
 * the sibling app loads (Keycloak SSO shares the session). Absolute http(s)
 * urls are used as-is.
 */
export function resolveResourceTarget(url: string | null, targetApp: string | null): ResourceTarget | null {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return { internal: false, href: url }
  if (!targetApp || targetApp === 'dashboard') return { internal: true, href: url }
  return { internal: false, href: `${peerOrigin(targetApp)}${url.startsWith('/') ? '' : '/'}${url}` }
}
