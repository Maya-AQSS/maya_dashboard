import type { BaseMeProfile } from '@maya/shared-profile-react'

/**
 * Shape del perfil devuelto por `GET /api/v1/me` de maya_dashboard. Hoy
 * proyecta el JWT (`JwtPassthroughResolver`).
 */
export type MeProfile = BaseMeProfile & {
  first_name: string | null
  last_name: string | null
  username: string | null
  department: string | null
  organization_id: string | null
  roles: string[]
  scope: string
}
