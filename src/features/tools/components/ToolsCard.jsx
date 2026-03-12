import styles from './ToolsCard.module.css'

function ToolsCard({ tool, onToggleFavorite }) {

  const isFavorite = Boolean(tool.is_favorite)

  const handleStarClick = (event) => {
    event.stopPropagation()
    event.preventDefault()
    onToggleFavorite(tool.id)
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <p className={styles.category}>{tool.category}</p>

        <button
          type="button"
          className={styles.favoriteBadge}
          onClick={handleStarClick}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </header>

      <a
        href={tool.documentation_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
      >
        <h3 className={styles.title}>{tool.name}</h3>
        <p className={styles.description}>{tool.description}</p>
      </a>
    </article>
  )
}


export default ToolsCard