import ToolsCard from './ToolsCard'

function ToolsGrid({ tools, onToggleFavorite, showLastUsed }) {

    if (!tools || tools.length === 0) return <p>No hay herramientas para mostrar</p>

    return (
        <div className="tools-grid">
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