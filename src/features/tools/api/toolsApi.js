import { TOOLS } from '../data/toolsData'

async function getToolsData() {

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        tools: TOOLS.map((tool) => ({
            id: tool.id,
            name: tool.name,
            category: tool.category,
            description: tool.description,
            isFavorite: tool.is_favorite,
            documentationUrl: tool.documentation_url,
            lastUsedAt: tool.last_used_at,
        })),
    }
}


async function toggleToolFavorite(id) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const tool = TOOLS.find((tool) => tool.id === Number(id))

    if (!tool) {
        throw new Error('Herramienta no encontrada')
    }

    tool.is_favorite = !tool.is_favorite

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

export { getToolsData, toggleToolFavorite }
