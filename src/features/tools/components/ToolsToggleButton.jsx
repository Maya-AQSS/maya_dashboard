import '../styles/tools.css'

function ToolsToggleButton({ showAll, onToggle }) {
  
  return (
    <button
      type="button"
      className="tools-toggle-button"
      onClick={onToggle}
    >
      {showAll ? 'Ver solo favoritas' : 'Ver todas las herramientas'}
    </button>
  )
}

export default ToolsToggleButton

