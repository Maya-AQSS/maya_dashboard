/**
 * Valida que un string sea una fecha ISO válida.
 * Retorna el string original si es válido, null en caso contrario.
 */
function validateIsoDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApplicationFromApi(app: any) {
  const defaultUrl = '#'

  return {
    id: app.id,
    name: app.name,
    category: app.category || 'aplicacion',
    description: app.description,
    isFavorite: Boolean(app.is_favorite),
    documentationUrl: app.traefik_url || app.documentation_url || defaultUrl,
    viewPermissionSlug: app.view_permission_slug ?? null,
    lastUsedAt: validateIsoDate(app.last_used_at || app.updated_at),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApplicationToApi(app: any) {
  return {
    id: app.id,
    name: app.name,
    category: app.category,
    description: app.description,
    is_favorite: app.isFavorite,
    documentation_url: app.documentationUrl,
    last_used_at: app.lastUsedAt,
  }
}

export { mapApplicationFromApi, mapApplicationToApi }
