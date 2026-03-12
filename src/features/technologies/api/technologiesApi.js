import { TECHNOLOGIES } from '../data/technologiesData'

async function getTechnologiesData() {

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        applications: TECHNOLOGIES.map(({ id, name, category, description, is_favorite, documentation_url }) => ({
            id,
            name,
            category,
            description,
            is_favorite,
            documentation_url,
        })),
    }
}


async function toggleTechnologyFavorite(id) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const technology = TECHNOLOGIES.find((tech) => tech.id === Number(id))

    if (!technology) {
        throw new Error('Tecnología no encontrada')
    }

    technology.is_favorite = !technology.is_favorite

    return { ...technology }
}

export { getTechnologiesData, toggleTechnologyFavorite }
