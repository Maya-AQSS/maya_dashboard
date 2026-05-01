/**
 * Valida que un string sea una fecha ISO válida.
 * Retorna el string original si es válido, null en caso contrario.
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
function validateIsoDate(value) {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : value
}

function mapApplicationFromApi(app) {
  const defaultUrl = '#'

  return {
    id: app.id,
    name: app.name,
    category: app.category || 'aplicacion',
    description: app.description,
    isFavorite: Boolean(app.is_favorite),
    documentationUrl: app.traefik_url || app.documentation_url || defaultUrl,
    lastUsedAt: validateIsoDate(app.last_used_at || app.updated_at),
  }
}

function mapApplicationToApi(app) {
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
