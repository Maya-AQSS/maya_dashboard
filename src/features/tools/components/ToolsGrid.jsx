import ToolsCard from './ToolsCard'

function ToolsGrid({ tools, onToggleFavorite, showLastUsed }) {

    if (!tools || tools.length === 0) return <p>No hay herramientas para mostrar</p>

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {tools.map((tool) => (
                <ToolsCard
                    key={tool.id}
                    tool={tool}
                    onToggleFavorite={onToggleFavorite}
                    showLastUsed={showLastUsed}
                />
            ))}
        </div>
    );
}

export default ToolsGrid;