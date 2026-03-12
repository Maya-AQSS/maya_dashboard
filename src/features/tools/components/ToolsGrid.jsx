import ToolsCard from './ToolsCard'

function ToolsGrid({ tools }) {

    if (!tools || tools.length === 0) return <div>No hay herramientas para mostrar</div>

    return (
        <div className="tools-grid">
            {tools.map((tool) => {
                return <ToolsCard key={tool.id} tool={tool} />
            })}
        </div>
    )
}

export default ToolsGrid