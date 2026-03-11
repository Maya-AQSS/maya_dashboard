async function getDashboardData() {

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        applications: [
            {
                id: 1,
                name: 'React',
                category: 'frontend',
                description: 'Librería JavaScript para construir interfaces de usuario mediante componentes.',
            },
            {
                id: 2,
                name: 'Vue',
                category: 'frontend',
                description: 'Framework progresivo de JavaScript para interfaces reactivas.',
            },
            {
                id: 3,
                name: 'Laravel',
                category: 'backend',
                description: 'Framework PHP orientado a MVC para construir APIs y aplicaciones web.',
            },
            {
                id: 4,
                name: 'Node.js',
                category: 'backend',
                description: 'Entorno de ejecución JavaScript en servidor basado en V8.',
            },
            {
                id: 5,
                name: 'PostgreSQL',
                category: 'base de datos',
                description: 'Sistema gestor de bases de datos relacional y open source.',
            },
            {
                id: 6,
                name: 'Redis',
                category: 'base de datos',
                description: 'Almacén clave-valor en memoria, ideal para caché y colas.',
            },
            {
                id: 7,
                name: 'Docker',
                category: 'devops',
                description: 'Plataforma de contenedores para empaquetar y desplegar aplicaciones.',
            },
            {
                id: 8,
                name: 'Kubernetes',
                category: 'devops',
                description: 'Orquestador de contenedores para despliegues escalables.',
            },
            {
                id: 9,
                name: 'GitHub Actions',
                category: 'devops',
                description: 'Plataforma de CI/CD integrada en GitHub para automatizar flujos.',
            },
            {
                id: 10,
                name: 'Tailwind CSS',
                category: 'frontend',
                description: 'Framework CSS utility-first para construir interfaces rápidas.',
            },
            {
                id: 11,
                name: 'TypeScript',
                category: 'lenguaje',
                description: 'Superset tipado de JavaScript que mejora la mantenibilidad.',
            },
            {
                id: 12,
                name: 'Jest',
                category: 'testing',
                description: 'Framework de testing para JavaScript orientado a unit tests.',
            },
        ],
    }
}

export { getDashboardData }