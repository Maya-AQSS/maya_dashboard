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


function getPageNumbersToDisplay(currentPage, totalPages) {

    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const set = new Set([1, totalPages, currentPage, currentPage - 1, currentPage - 2, currentPage + 1, currentPage + 2])
    const sorted = [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
    const result = []
    let prev = 0

    for (const p of sorted) {
        if (p > prev + 1) result.push('ellipsis')
        result.push(p)
        prev = p
    }
    
    return result
}

export { buildVisibleTools, paginate, getPageNumbersToDisplay }