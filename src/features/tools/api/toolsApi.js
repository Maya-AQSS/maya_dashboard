import { TOOLS } from '../data/toolsData'

async function getToolsData() {

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        applications: TOOLS.map(({ id, name, category, description, is_favorite, documentation_url }) => ({
            id,
            name,
            category,
            description,
            is_favorite,
            documentation_url,
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

    return { ...tool }
}

export { getToolsData, toggleToolFavorite }
