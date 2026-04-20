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

function mapToolFromApi(tool) {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    description: tool.description,
    isFavorite: tool.is_favorite,
    documentationUrl: tool.documentation_url,
    lastUsedAt: validateIsoDate(tool.last_used_at),
  }
}

function mapToolToApi(tool) {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    description: tool.description,
    is_favorite: tool.isFavorite,
    documentation_url: tool.documentationUrl,
    last_used_at: tool.lastUsedAt,
  }
}

export { mapToolFromApi, mapToolToApi }
