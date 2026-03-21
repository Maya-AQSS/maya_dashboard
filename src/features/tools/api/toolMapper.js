function mapToolFromApi(tool) {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    description: tool.description,
    isFavorite: tool.is_favorite,
    documentationUrl: tool.documentation_url,
    lastUsedAt: tool.last_used_at,
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
