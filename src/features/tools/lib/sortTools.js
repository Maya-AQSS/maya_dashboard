function sortToolsByName(tools) {
    return [...tools].sort((a, b) => a.name.localeCompare(b.name))
}

function sortFavoriteToolsByLastUsedAt(tools) {
    return [...tools]
        .filter((tool) => tool.isFavorite)
        .sort((a, b) => {
            const aValue = a.lastUsedAt ?? ''
            const bValue = b.lastUsedAt ?? ''
            return bValue.localeCompare(aValue)
        })
}

export { sortToolsByName, sortFavoriteToolsByLastUsedAt }