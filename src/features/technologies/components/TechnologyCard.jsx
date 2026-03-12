import styles from './TechnologyCard.module.css'
import { Link } from 'react-router-dom'

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

            <h3 className={styles.title}>{technology.name}</h3>
            <p className={styles.description}>{technology.description}</p>

            <Link
                to={`/technologies/${technology.id}`}
                className={`${styles.link} ${styles.button}`}
            >
                Ver detalle
            </Link>
        </article>
    )
}

export default TechnologyCard