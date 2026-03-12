import styles from './ToolsCard.module.css'

function ToolsCard({ tool }) {
  const isFavorite = Boolean(tool.is_favorite)

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <p className={styles.category}>{tool.category}</p>

        {isFavorite && (
          <span className={styles.favoriteBadge}>
            ★
          </span>
        )}
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