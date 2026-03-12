import { TOOLS } from '../data/toolsData'
import { mapToolFromApi } from './toolMapper'

async function getToolsData() {

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        tools: TOOLS.map(mapToolFromApi),
      }
}


async function toggleToolFavorite(id) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const tool = TOOLS.find((tool) => tool.id === Number(id))

    if (!tool) {
        throw new Error('Herramienta no encontrada')
    }

    tool.is_favorite = !tool.is_favorite

    return mapToolFromApi(tool)
}

export { getToolsData, toggleToolFavorite }
