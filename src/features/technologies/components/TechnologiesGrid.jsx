import TechnologyCard from './TechnologyCard'

function TechnologiesGrid({ technologies }) {

    if (!technologies || technologies.length === 0) return <div>No hay tecnologías para mostrar</div>

    return (
        <div className="technologies-grid">
            {technologies.map((technology) => (
                <TechnologyCard key={technology.id} technology={technology} />
            ))}
        </div>
    )
}

export default TechnologiesGrid