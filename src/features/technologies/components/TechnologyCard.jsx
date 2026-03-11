import styles from './TechnologyCard.module.css'
import { Link } from 'react-router-dom'

function TechnologyCard({ technology }) {
    return (
        <article className={styles.card}>
            <h3 className={styles.title}>{technology.name}</h3>
            <p className={styles.category}>{technology.category}</p>
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