import type { StandardMeProfile } from '@ceedcv-maya/shared-profile-react'

/**
 * Shape del perfil devuelto por `GET /api/v1/me` de maya_dashboard.
 *
 * 0.16.0: la forma es idéntica en las 4 apps estándar (authorization, audit,
 * logs, dashboard), así que se adopta `StandardMeProfile` del paquete
 * compartido. Los campos canónicos en español (`permisos`, `tipo_estudios`,
 * `estudios`, `modulos`, `equipos`) viven en `BaseMeProfile`; maya_dashboard
 * los devuelve como arrays vacíos — la autorización se delega al middleware
 * `RequirePermission` contra maya_authorization vía FDW.
 *
 * Eliminados del payload (no exponer en /me):
 * - `roles`, `department`/`departamento`, `organization_id`.
 */
export type MeProfile = StandardMeProfile
