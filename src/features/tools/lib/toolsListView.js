import { sortToolsByName, sortFavoriteToolsByLastUsedAt } from './sortTools'

function buildVisibleTools(tools, { showAll, searchTerm }) {
    if (!tools || tools.length === 0) return []

    const normalizedSearch = searchTerm.trim().toLowerCase()

    const baseList = showAll ? tools : tools.filter((tool) => tool.isFavorite)

    const filtered = !normalizedSearch
        ? baseList
        : baseList.filter((tool) =>
            [tool.name, tool.category, tool.description]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(normalizedSearch))
        )

    return showAll
        ? sortToolsByName(filtered)
        : sortFavoriteToolsByLastUsedAt(filtered)
}

function paginate(items, { pageSize, currentPage }) {
    const totalItems = items.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    const safePage = Math.min(Math.max(currentPage, 1), totalPages)

    const startIndex = (safePage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageItems = items.slice(startIndex, endIndex)

    return {
        pageItems,
        meta: {
            totalItems,
            totalPages,
            currentPage: safePage,
            startIndex,
            endIndex,
            canGoPrev: safePage > 1,
            canGoNext: safePage < totalPages,
        },
    }
}

export { buildVisibleTools, paginate }