import styles from './TechnologyCard.module.css'

function TechnologyCard({ technology }) {
  const isFavorite = Boolean(technology.is_favorite)

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <p className={styles.category}>{technology.category}</p>

        {isFavorite && (
          <span className={styles.favoriteBadge}>
            ★
          </span>
        )}
      </header>

      <a
        href={technology.documentation_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
      >
        <h3 className={styles.title}>{technology.name}</h3>
        <p className={styles.description}>{technology.description}</p>
      </a>
    </article>
  )
}

  
export default TechnologyCard