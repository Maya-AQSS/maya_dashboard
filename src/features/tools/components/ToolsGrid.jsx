import ToolsCard from './ToolsCard'

function ToolsGrid({ tools, onToggleFavorite, showLastUsed }) {

    if (!tools || tools.length === 0) return <p>No hay herramientas para mostrar</p>

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
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